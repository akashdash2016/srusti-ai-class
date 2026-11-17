"""Builds src/data/assignment_report.json from the three Google Forms CSV
exports, matching every response against the section rosters.

Run from the project root:  python3 analysis/generate_report_data.py
"""

import csv, json, re, collections, difflib, datetime

ROOT = "."


def nname(s):
    return re.sub(r"[^a-z]", "", (s or "").lower())


def nsec(v):
    m = re.search(r"([ABC])\s*$", (v or "").strip(), re.I)
    return m.group(1).upper() if m else None


def parse_ts(value):
    return datetime.datetime.strptime(value.strip(), "%m/%d/%Y %H:%M:%S")


roster = {}
for s in "ABC":
    for x in json.load(open(f"{ROOT}/src/data/section_{s}_students.json")):
        roster[(s, x["roll_no"])] = x["name"]

by_name = collections.defaultdict(list)
for k, v in roster.items():
    by_name[nname(v)].append(k)

ASSIGNMENTS = [
    dict(
        id="a1", code="A1", kind="assignment",
        title="AI Assignment Submission",
        short_title="AI Assignment",
        date_label="21 – 30 Sep 2026",
        window_start="2026-09-21", window_end="2026-09-30",
        file=f"{ROOT}/csv_files/AI Assignment Submission (Responses) - Form Responses 1.csv",
        roll_key="Roll number ", name_key="Full name", section_key="Section",
    ),
    dict(
        id="a2", code="A2", kind="quiz",
        title="MBA AI Quiz — Set 1: AI Foundations",
        short_title="AI Quiz Set 1",
        date_label="5 Oct 2026",
        window_start="2026-10-05", window_end="2026-10-05",
        file=f"{ROOT}/csv_files/MBA AI Quiz - Set 1_ AI Foundations (Responses) - Form Responses 1.csv",
        roll_key="Enter Your Class Roll Number", name_key="Enter Your Name",
        section_key="Select Your Section",
    ),
    dict(
        id="a3", code="A3", kind="assignment",
        title="Student Assignment Submission",
        short_title="Assignment Submission",
        date_label="11 – 16 Nov 2026",
        window_start="2026-11-11", window_end="2026-11-16",
        file=f"{ROOT}/csv_files/Student Assignment Submission Form (Responses) - Form Responses 1.csv",
        roll_key="Roll Number", name_key="Full Name of the Student", section_key="Section",
    ),
]


def resolve(row, cfg):
    """Returns (key, flags, raw_name, raw_roll, sec) after cleaning the row."""
    raw_name = row[cfg["name_key"]].strip()
    raw_roll = row[cfg["roll_key"]].strip()
    sec = nsec(row[cfg["section_key"]])
    flags = []

    swapped = False
    original_name, original_roll = raw_name, raw_roll
    if raw_roll and not re.search(r"\d", raw_roll) and re.fullmatch(r"\d{1,2}", raw_name):
        raw_name, raw_roll = raw_roll, raw_name
        swapped = True

    groups = re.findall(r"\d+", raw_roll)
    rolls = [int(g) for g in groups if 1 <= int(g) <= 60]

    name_exact = by_name.get(nname(raw_name), [None])[0]

    best_roll, best_sim = None, -1.0
    for roll in rolls:
        cand = (sec, roll)
        if cand in roster:
            sim = difflib.SequenceMatcher(None, nname(raw_name), nname(roster[cand])).ratio()
            if sim > best_sim:
                best_roll, best_sim = cand, sim

    key = None
    if name_exact and best_roll and best_roll != name_exact and best_sim < 0.7:
        key = name_exact
        flags.append("roll")
    elif best_roll:
        key = best_roll
        if raw_roll.strip() != str(key[1]):
            # leading zeros are cosmetic, anything else is a real correction
            flags.append("roll" if not re.fullmatch(r"0+%d" % key[1], raw_roll) else "format")
    elif name_exact:
        key = name_exact
        flags.append("roll")
    else:
        # fall back to a fuzzy name match across the whole roster
        best, score = None, 0.0
        for k, v in roster.items():
            r = difflib.SequenceMatcher(None, nname(raw_name), nname(roster[k])).ratio()
            if r > score:
                best, score = k, r
        key = best if score >= 0.86 else None
        if key:
            flags.append("roll")

    if swapped:
        flags.append("swap")

    if key in roster and key[0] != sec:
        flags.append("section")

    if key in roster:
        ratio = difflib.SequenceMatcher(None, nname(raw_name), nname(roster[key])).ratio()
        if ratio < 0.95 and not swapped:
            flags.append("name")

    return key, flags, raw_name, raw_roll, sec, original_name, original_roll


records = {}
all_discrepancies = []
format_notes = 0

for cfg in ASSIGNMENTS:
    rows = list(csv.DictReader(open(cfg["file"], encoding="utf-8-sig")))
    first = {}
    events = []
    for row in rows:
        key, flags, raw_name, raw_roll, sec, original_name, original_roll = resolve(row, cfg)
        ts = parse_ts(row["Timestamp"])
        late = ts.date() > datetime.date.fromisoformat(cfg["window_end"])
        if late:
            flags.append("late")
        event = dict(
            key=key, flags=flags, raw_name=raw_name, raw_roll=raw_roll, sec=sec,
            original_name=original_name, original_roll=original_roll,
            ts=ts, email=row["Email Address"].strip().lower(),
            score=row.get("Score"),
        )
        events.append(event)
        if key and key in roster:
            if key in first:
                first[key]["dupes"].append(event)
            else:
                first[key] = dict(event=event, dupes=[])
        format_notes += flags.count("format")

    # per-student status for this assignment
    for key, entry in first.items():
        ev = entry["event"]
        status = {
            "submitted": True,
            "at": ev["ts"].isoformat(),
            "flags": [f for f in ev["flags"] if f != "format"],
        }
        if cfg["kind"] == "quiz" and ev["score"]:
            status["score"] = int(ev["score"].split("/")[0].strip())
        if entry["dupes"]:
            status["flags"].append("duplicate")
        records.setdefault(key, {})[cfg["id"]] = status

        # discrepancy entries
        if "swap" in ev["flags"]:
            all_discrepancies.append(dict(
                assignment=cfg["id"], section=key[0], roll=key[1], name=roster[key],
                kind="swap", severity="medium", at=ev["ts"].isoformat(),
                title="Name and roll-number fields were swapped",
                detail=f'Name field contained “{ev["original_name"]}” and roll field contained '
                       f'“{ev["original_roll"]}”. Resolved to {key[0]}{key[1]} · {roster[key]} '
                       f"from the email and roster.",
            ))
        if "roll" in ev["flags"]:
            raw = ev["raw_roll"]
            other = None
            if raw.isdigit() and 1 <= int(raw) <= 60:
                other = roster.get((key[0], int(raw)))
            detail = f"Recorded roll was “{raw}”."
            if other and other != roster[key]:
                detail += f" Roll {raw} belongs to {other}; matched to {key[0]}{key[1]} by name."
            elif other is None:
                detail += f" Matched by name to {key[0]}{key[1]} · {roster[key]}."
            else:
                detail += f" Normalised to {key[0]}{key[1]}."
            all_discrepancies.append(dict(
                assignment=cfg["id"], section=key[0], roll=key[1], name=roster[key],
                kind="roll", severity="high" if other and other != roster[key] else "medium",
                at=ev["ts"].isoformat(),
                title=f"Roll number entered as “{raw}”",
                detail=detail,
            ))
        if "name" in ev["flags"]:
            all_discrepancies.append(dict(
                assignment=cfg["id"], section=key[0], roll=key[1], name=roster[key],
                kind="name", severity="low", at=ev["ts"].isoformat(),
                title="Name recorded differently",
                detail=f'Form shows “{ev["raw_name"]}” · roster name is “{roster[key]}”. '
                       f"Matched using the roll number.",
            ))
        if "late" in ev["flags"]:
            all_discrepancies.append(dict(
                assignment=cfg["id"], section=key[0], roll=key[1], name=roster[key],
                kind="late", severity="medium", at=ev["ts"].isoformat(),
                title="Submitted after the window",
                detail=f"Response arrived {ev['ts'].strftime('%-d %b %Y, %H:%M')} "
                       f"(window ended {datetime.date.fromisoformat(cfg['window_end']).strftime('%-d %b')}).",
            ))
        if entry["dupes"]:
            all_discrepancies.append(dict(
                assignment=cfg["id"], section=key[0], roll=key[1], name=roster[key],
                kind="duplicate", severity="low", at=ev["ts"].isoformat(),
                title=f"Submitted {1 + len(entry['dupes'])} times",
                detail="First: " + ev["ts"].strftime("%-d %b, %H:%M") + " · " + " · ".join(
                    d["ts"].strftime("%-d %b, %H:%M") for d in entry["dupes"]
                ) + ". Counted once.",
            ))

    cfg["response_count"] = len(rows)
    cfg["distinct_count"] = len(first)

# students array, roster order
students = []
for s in "ABC":
    for k in [k for k in roster if k[0] == s]:
        st = records.get(k, {})
        row = dict(section=s, roll=k[1], name=roster[k])
        for cfg in ASSIGNMENTS:
            row[cfg["id"]] = st.get(cfg["id"], {"submitted": False, "flags": []})
        row["submittedCount"] = sum(1 for cfg in ASSIGNMENTS if row[cfg["id"]]["submitted"])
        students.append(row)

payload = dict(
    generated_at=datetime.date.today().isoformat(),
    class_size=len(students),
    roll_format_notes=format_notes,
    assignments=[
        dict(
            id=c["id"], code=c["code"], kind=c["kind"], title=c["title"],
            shortTitle=c["short_title"], dateLabel=c["date_label"],
            windowStart=c["window_start"], windowEnd=c["window_end"],
            responseCount=c["response_count"], distinctCount=c["distinct_count"],
            totalMarks=10 if c["kind"] == "quiz" else None,
        )
        for c in ASSIGNMENTS
    ],
    students=students,
    discrepancies=sorted(
        all_discrepancies,
        key=lambda d: (d["assignment"], -{"high": 3, "medium": 2, "low": 1}[d["severity"]]),
    ),
)

out = f"{ROOT}/src/data/assignment_report.json"
with open(out, "w") as f:
    json.dump(payload, f, indent=2, ensure_ascii=False)

print(f"wrote {out}")
print("students:", len(students), "discrepancies:", len(all_discrepancies))
print("submitted per assignment:", {c["code"]: c["distinct_count"] for c in ASSIGNMENTS})
print("discrepancy kinds:", collections.Counter(d["kind"] for d in all_discrepancies))
