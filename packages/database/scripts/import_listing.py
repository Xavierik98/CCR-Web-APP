"""Construit l'import complet du fichier de suivi CCR vers le schéma Prisma.

Usage : python3 -I build_import.py <listing.xlsx> <dossier_sortie>
Produit : report.txt (rapprochements à relire) et import.sql (une transaction).
"""
import datetime as dt
import json
import re
import sys
import unicodedata
import uuid
from collections import defaultdict

import openpyxl

SRC, OUT = sys.argv[1], sys.argv[2]
wb = openpyxl.load_workbook(SRC, data_only=True)

TITLES = {"ancien", "maman", "papa", "respo", "pasteur", "pp", "diaco", "mme",
          "mr", "m", "couple", "les", "frere", "soeur", "freere"}
FIRST_SUNDAY = dt.date(2026, 3, 1)


def clean(value):
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


def strip_accents(text):
    return "".join(c for c in unicodedata.normalize("NFD", text)
                   if unicodedata.category(c) != "Mn")


def tokens(name, keep_titles=False):
    base = strip_accents(name.lower()).replace("'", " ").replace("-", " ")
    words = re.findall(r"[a-z0-9]+", base)
    if not keep_titles:
        words = [w for w in words if w not in TITLES]
    return frozenset(words)


def norm_phone(raw):
    digits = re.sub(r"\D", "", clean(raw))
    if not digits:
        return None
    if digits.startswith("212") and len(digits) == 12:
        digits = digits[3:]
    if len(digits) == 10 and digits.startswith("0"):
        return digits[1:]
    if len(digits) == 9 and digits[0] in "567":
        return digits
    return digits  # numéro étranger, gardé tel quel


def split_name(full):
    words = full.split()
    upper = [w for w in words if len(w) >= 2 and re.fullmatch(r"[A-ZÀ-Ý'\-]+", w)]
    if upper and len(upper) < len(words):
        rest = [w for w in words if w not in upper]
        return " ".join(rest), " ".join(upper)
    return full, ""


class Member:
    def __init__(self, name, source):
        self.id = str(uuid.uuid4())
        self.name = name
        self.phone = None
        self.email = None
        self.category = None
        self.professional = None
        self.status = "ACTIVE"
        self.departure_reason = None
        self.birth_date = None
        self.notes = []
        self.sources = [source]
        self.group_id = None

    @property
    def toks(self):
        return tokens(self.name)


members = []
by_phone = {}
report = []


def find(name, phone, source, strict=False):
    p = norm_phone(phone)
    if p and p in by_phone:
        return by_phone[p], "téléphone"
    t = tokens(name, keep_titles=strict)
    if not t:
        return None, None

    def phone_ok(m):
        # Deux numéros connus et différents : ce ne sont pas les mêmes personnes.
        return not (p and m.phone and norm_phone(m.phone) != p)

    exact = [m for m in members if tokens(m.name, strict) == t and phone_ok(m)]
    if len(exact) == 1:
        return exact[0], "nom identique"
    if strict:
        return None, None
    # Une fiche réduite à un prénom ("Esther") ne capte pas un nom complet
    # ("Esther DJOH") : plusieurs personnes peuvent porter ce prénom.
    sub = [m for m in members if phone_ok(m)
           and (t < m.toks or (m.toks < t and len(m.toks) > 1))
           and max(len(w) for w in (t & m.toks) or {""}) >= 3]
    if len(sub) == 1:
        return sub[0], "nom partiel"
    if len(sub) > 1:
        report.append(f"AMBIGU [{source}] '{name}' -> {[m.name for m in sub]} : nouvelle fiche créée")
    return None, None


def get_or_create(name, phone=None, source="", strict=False):
    name = clean(name)
    m, how = find(name, phone, source, strict)
    if m is None:
        m = Member(name, source)
        members.append(m)
        report.append(f"NOUVEAU [{source}] {name}")
    else:
        if source not in m.sources:
            m.sources.append(source)
        if how != "téléphone" and m.name != name:
            report.append(f"RAPPROCHÉ ({how}) [{source}] '{name}' = '{m.name}'")
    p = norm_phone(phone)
    if p and not m.phone:
        m.phone = clean(phone)
        by_phone[p] = m
    return m


# 1. Listes de présence (référence des membres et de leur catégorie)
events = {}
attendance = set()
for sheet, category in (("Hommes", "MAN"), ("Femmes", "WOMAN"), ("Enfants", "CHILD")):
    ws = wb[sheet]
    first_col = 3 if sheet != "Enfants" else 2
    for r in range(3, ws.max_row + 1):
        name = clean(ws.cell(row=r, column=1).value)
        if not name or re.fullmatch(r"\d+", name):
            continue
        phone = ws.cell(row=r, column=2).value if sheet != "Enfants" else None
        m = Member(name, sheet)
        m.category = category
        if re.match(r"nouve(au|lle)", name, re.I):
            m.notes.append("Nouveau venu : nom à compléter.")
        p = norm_phone(phone)
        if p:
            m.phone = clean(phone)
            by_phone.setdefault(p, m)
        members.append(m)
        for c in range(first_col, ws.max_column + 1):
            if clean(ws.cell(row=r, column=c).value).upper() != "OUI":
                continue
            date = FIRST_SUNDAY + dt.timedelta(weeks=c - first_col)
            events.setdefault(date, str(uuid.uuid4()))
            attendance.add((m.id, date))

# 2. Statut professionnel
for sheet, status in (("Salariés", "EMPLOYEE"), ("Entrepreneurs", "ENTREPRENEUR"),
                      ("Étudiant", "STUDENT"), ("Chomage", "UNEMPLOYED")):
    ws = wb[sheet]
    for row in ws.iter_rows(min_row=2, values_only=True):
        if not clean(row[1]) or clean(row[1]).startswith("Nom"):
            continue
        get_or_create(row[1], row[2], sheet).professional = status

# 3. Départements et fonctions (liste des ouvriers)
departments = {}
memberships = {}


def dept_name(header):
    h = clean(header)
    h = re.sub(r"^D[ée]partement (de la |du |de l'|de l’|des |de )?", "", h, flags=re.I)
    mapping = {"Responsables des EDM": "Responsables des églises de maison",
               "Gestion de l'Ecodim": "Ecodim", "FILS D'ABRAHAM": "Fils d'Abraham",
               "Les femmes": "Les femmes"}
    h = mapping.get(h, h)
    return h[:1].upper() + h[1:]


ws = wb["Liste des ouvriers"]
current = None
for row in ws.iter_rows(min_row=4, values_only=True):
    a, b, c = clean(row[0]), clean(row[1]), clean(row[2])
    if a and not b and not c and not a.lower().startswith("nom"):
        current = dept_name(a)
        departments.setdefault(current, str(uuid.uuid4()))
        continue
    if not current or a.lower().startswith("nom") or (not a and not b):
        continue
    if not a:
        report.append(f"IGNORÉ [Ouvriers/{current}] ligne sans nom (tél {b})")
        continue
    m = get_or_create(a, b, f"Ouvriers/{current}")
    key = (m.id, departments[current])
    if key not in memberships or (c and not memberships[key]):
        memberships[key] = c or None

# 4. Liste JCCR (anniversaires, e-mails, propositions)
departments.setdefault("JCCR", str(uuid.uuid4()))
ws = wb["Liste JCCR"]
for row in ws.iter_rows(min_row=2, values_only=True):
    if not clean(row[0]):
        continue
    m = get_or_create(row[0], row[4], "Liste JCCR")
    birth = row[1]
    if isinstance(birth, dt.datetime):
        if birth.year < 2015:
            m.birth_date = birth.date()
        else:
            m.notes.append(f"Anniversaire : {birth.day:02d}/{birth.month:02d}.")
    if clean(row[5]) and not m.email:
        m.email = clean(row[5])
    if clean(row[2]).lower() == "non":
        m.notes.append("JCCR : inactif.")
    if clean(row[3]) and clean(row[3]).lower() not in {"oui", "non"}:
        m.notes.append(f"Proposition JCCR : {clean(row[3])}")
    memberships.setdefault((m.id, departments["JCCR"]), "Membre")

# 5. Titres de séjour (table réservée à l'accompagnement social)
social = {}
ws = wb["Titre Séjour OK"]
for row in ws.iter_rows(min_row=2, values_only=True):
    if not clean(row[0]):
        continue
    m = get_or_create(row[0], row[2], "Titre Séjour OK")
    if clean(row[3]) and not m.email:
        m.email = clean(row[3])
    social[m.id] = {"status": "VALID", "doc": clean(row[1]) or None,
                    "renew": None, "difficulty": None}
ws = wb["Titre Séjour KO"]
for row in ws.iter_rows(min_row=2, values_only=True):
    if not clean(row[0]):
        continue
    m = get_or_create(row[0], row[4], "Titre Séjour KO")
    if clean(row[5]) and not m.email:
        m.email = clean(row[5])
    social[m.id] = {"status": "EXPIRED", "doc": clean(row[1]) or None,
                    "renew": clean(row[2]).lower() == "oui",
                    "difficulty": clean(row[3]) or None}
ws = wb["Jamais eu de séjour"]
for row in ws.iter_rows(min_row=2, values_only=True):
    if not clean(row[0]):
        continue
    m = get_or_create(row[0], None, "Jamais eu de séjour")
    social[m.id] = {"status": "NEVER_HAD", "doc": None, "renew": None, "difficulty": None}

# 6. Groupes de suivi (responsable -> personnes suivies)
groups = []
ws = wb["Suivi 15092023"]
current_group = None
for row in ws.iter_rows(min_row=3, values_only=True):
    resp, person, phone = clean(row[0]), clean(row[1]), row[2]
    if resp:
        leader, _ = find(resp, None, "Suivi (responsable)")
        current_group = {"id": str(uuid.uuid4()), "name": f"Suivi de {resp}",
                         "leader": leader.id if leader else None}
        if not leader:
            report.append(f"RESPONSABLE NON IDENTIFIÉ [Suivi] {resp} : groupe créé sans responsable lié")
        groups.append(current_group)
    if person and current_group:
        m = get_or_create(person, phone, "Suivi")
        if not m.group_id:
            m.group_id = current_group["id"]
used_leaders = set()
for g in groups:
    if g["leader"] in used_leaders:
        g["leader"] = None
    elif g["leader"]:
        used_leaders.add(g["leader"])

# 7. Départs de l'année (rapprochement strict : téléphone ou nom identique)
ws = wb["Les départs de l'année"]
for row in ws.iter_rows(min_row=3, values_only=True):
    if not clean(row[0]):
        continue
    m = get_or_create(row[0], row[1], "Départs", strict=True)
    m.status = "DEPARTED"
    m.departure_reason = clean(row[2]) or None

# 8. Collecte du 31/12/2025 et relances
ws = wb["Collecte 31122025"]
pledges = {}


def money(value):
    v = clean(value)
    return v if re.fullmatch(r"\d+(\.\d+)?", v) else None


# Deux passes : la liste principale d'abord, puis les relances, pour qu'une
# ligne principale située plus bas n'écrase pas une relance déjà lue.
for row in ws.iter_rows(min_row=3, values_only=True):
    name = clean(row[1])
    if name and re.fullmatch(r"\d+", clean(row[0])):
        member, _ = find(name, None, "Collecte")
        pledges[tokens(name, True)] = {"donor": name, "amount": money(row[2]),
                                       "member": member.id if member and not name.lower().startswith(("couple", "les ")) else None,
                                       "done": False, "comment": None}
for row in ws.iter_rows(min_row=3, values_only=True):
    rname = clean(row[5])
    if rname and re.fullmatch(r"\d+", clean(row[4])):
        key = tokens(rname, True)
        p = pledges.setdefault(key, {"donor": rname, "amount": None, "member": None,
                                     "done": False, "comment": None})
        relance, comment = clean(row[7]).upper(), clean(row[8])
        p["done"] = relance == "OUI"
        notes = []
        if relance not in ("OUI", "NON") and relance:
            notes.append("Relance : à confirmer")
        if comment:
            notes.append(comment)
        p["comment"] = " ; ".join(notes) or None
        if not p["amount"]:
            p["amount"] = money(row[6])

# Catégorie déduite seulement des titres sans ambiguïté, pour les personnes
# absentes des listes Hommes / Femmes / Enfants.
for m in members:
    if m.category is None:
        first_word = tokens(m.name.split()[0], keep_titles=True)
        if first_word & {"maman", "mme", "soeur"}:
            m.category = "WOMAN"
        elif first_word & {"papa", "pasteur", "frere"}:
            m.category = "MAN"

# Traçabilité : onglets d'origine, pour relecture par l'administrateur
for m in members:
    m.notes.insert(0, "Importé depuis : " + ", ".join(dict.fromkeys(m.sources)) + ".")

# ---------------------------------------------------------------- SQL
def q(v):
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, (dt.date, dt.datetime)):
        return "'" + v.isoformat() + "'"
    return "'" + str(v).replace("'", "''") + "'"


sql = ["BEGIN;"]
for name, did in departments.items():
    sql.append(f'INSERT INTO "Department" (id, name, "isPublished") VALUES ({q(did)}, {q(name)}, FALSE);')
for g in groups:
    sql.append(f'INSERT INTO "Group" (id, name) VALUES ({q(g["id"])}, {q(g["name"])});')
for m in members:
    first, last = split_name(m.name)
    cat = f"'{m.category}'::\"MemberCategory\"" if m.category else "NULL"
    prof = f"'{m.professional}'::\"ProfessionalStatus\"" if m.professional else "NULL"
    sql.append(
        'INSERT INTO "Member" (id, "firstName", "lastName", phone, email, category, "birthDate", notes, '
        '"membershipStatus", "departureReason", "professionalStatus", "groupId", "createdAt", "updatedAt") VALUES ('
        f"{q(m.id)}, {q(first)}, {q(last)}, {q(m.phone)}, {q(m.email)}, {cat}, {q(m.birth_date)}, "
        f"{q(chr(10).join(m.notes))}, '{m.status}'::\"MembershipStatus\", {q(m.departure_reason)}, {prof}, "
        f"{q(m.group_id)}, now(), now());")
for g in groups:
    if g["leader"]:
        sql.append(f'UPDATE "Group" SET "leaderMemberId" = {q(g["leader"])} WHERE id = {q(g["id"])};')
for (mid, did), role in memberships.items():
    sql.append(f'INSERT INTO "DepartmentMembership" (id, "memberId", "departmentId", role) '
               f"VALUES ({q(str(uuid.uuid4()))}, {q(mid)}, {q(did)}, {q(role)});")
for mid, s in social.items():
    sql.append('INSERT INTO "SocialSupportRecord" (id, "memberId", "residencyStatus", "documentNumber", '
               '"hasRenewalDocuments", "renewalDifficulty", "updatedAt") VALUES ('
               f"{q(str(uuid.uuid4()))}, {q(mid)}, '{s['status']}'::\"ResidencyStatus\", {q(s['doc'])}, "
               f"{q(s['renew'])}, {q(s['difficulty'])}, now());")
for date, eid in sorted(events.items()):
    start = dt.datetime.combine(date, dt.time(9, 30))  # 10h30 à Casablanca (UTC+1)
    sql.append(f'INSERT INTO "ServiceEvent" (id, title, type, "startAt", "isPublic") VALUES '
               f"({q(eid)}, 'Rassemblement dominical', 'SERVICE', {q(start)}, FALSE);")
for mid, date in sorted(attendance, key=lambda x: (x[1], x[0])):
    start = dt.datetime.combine(date, dt.time(9, 30))
    sql.append(f'INSERT INTO "Attendance" (id, "memberId", "eventId", present, "checkedInAt", "checkInMethod") '
               f"VALUES ({q(str(uuid.uuid4()))}, {q(mid)}, {q(events[date])}, TRUE, {q(start)}, 'MANUAL');")
camp = str(uuid.uuid4())
sql.append(f'INSERT INTO "Campaign" (id, name, "startDate") VALUES ({q(camp)}, '
           f"'Collecte du 31 décembre 2025', '2025-12-31T00:00:00');")
for p in pledges.values():
    sql.append('INSERT INTO "Pledge" (id, "campaignId", "memberId", "donorName", "amountPromised", '
               '"followUpDone", comment) VALUES ('
               f"{q(str(uuid.uuid4()))}, {q(camp)}, {q(p['member'])}, {q(p['donor'])}, "
               f"{p['amount'] or 'NULL'}, {q(p['done'])}, {q(p['comment'])});")
sql.append("COMMIT;")

open(f"{OUT}/import.sql", "w", encoding="utf-8").write("\n".join(sql))
stats = {
    "membres": len(members),
    "par_catégorie": {k: sum(1 for m in members if m.category == k) for k in ("MAN", "WOMAN", "CHILD", None)},
    "départs": sum(1 for m in members if m.status == "DEPARTED"),
    "statut_pro": sum(1 for m in members if m.professional),
    "départements": len(departments),
    "adhésions": len(memberships),
    "titres_de_séjour": len(social),
    "groupes": len(groups),
    "cultes": len(events),
    "présences": len(attendance),
    "engagements": len(pledges),
}
open(f"{OUT}/report.txt", "w", encoding="utf-8").write(
    json.dumps(stats, ensure_ascii=False, indent=1, default=str) + "\n\n" + "\n".join(report))
print(json.dumps(stats, ensure_ascii=False, default=str))
