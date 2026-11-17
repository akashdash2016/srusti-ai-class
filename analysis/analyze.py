import csv, json, re, collections, difflib, statistics

def nname(s):
    return re.sub(r'[^a-z]', '', (s or '').lower())

def nsec(v):
    m = re.search(r'([ABC])\s*$', (v or '').strip(), re.I)
    return m.group(1).upper() if m else None

roster = {}
for s in "ABC":
    for x in json.load(open(f"src/data/section_{s}_students.json")):
        roster[(s, x["roll_no"])] = x["name"]

by_name = collections.defaultdict(list)
for k, v in roster.items():
    by_name[nname(v)].append(k)

def match_name(name):
    n = nname(name)
    if not n:
        return None
    if n in by_name:
        return by_name[n][0]
    best, score = None, 0.0
    for k, v in roster.items():
        r = difflib.SequenceMatcher(None, n, nname(v)).ratio()
        if r > score:
            best, score = k, r
    return best if score >= 0.86 else None

FILES = [
    ("A1", "21-30 Sep · AI Assignment Submission",
     "csv_files/AI Assignment Submission (Responses) - Form Responses 1.csv",
     "Roll number ", "Full name", "Section", True),
    ("A2", "5 Oct · MBA AI Quiz Set 1",
     "csv_files/MBA AI Quiz - Set 1_ AI Foundations (Responses) - Form Responses 1.csv",
     "Enter Your Class Roll Number", "Enter Your Name", "Select Your Section", False),
    ("A3", "11-16 Nov · Student Assignment Submission",
     "csv_files/Student Assignment Submission Form (Responses) - Form Responses 1.csv",
     "Roll Number", "Full Name of the Student", "Section", True),
]

results = {}
for code, label, path, rk, nk, sk, has_link in FILES:
    rows = list(csv.DictReader(open(path, encoding="utf-8-sig")))
    events, seen = [], collections.defaultdict(list)
    for r in rows:
        raw_name, raw_roll = r[nk].strip(), r[rk].strip()
        sec = nsec(r[sk])
        # handle swapped name/roll fields
        swapped = False
        if raw_roll and not re.search(r'\d', raw_roll) and re.fullmatch(r'\d{1,2}', raw_name):
            raw_name, raw_roll = raw_roll, raw_name
            swapped = True
        groups = re.findall(r'\d+', raw_roll)
        rolls = [int(g) for g in groups if 1 <= int(g) <= 60]
        key, issue = None, None
        name_exact = by_name.get(nname(raw_name), [None])[0]
        # pick the roll candidate whose roster name best matches what was typed
        best_roll, best_sim = None, -1
        for roll in rolls:
            cand = (sec, roll)
            if cand in roster:
                sim = difflib.SequenceMatcher(None, nname(raw_name), nname(roster[cand])).ratio()
                if sim > best_sim:
                    best_roll, best_sim = cand, sim
        if name_exact and best_roll and best_roll != name_exact and best_sim < 0.7:
            key = name_exact
            issue = f"roll field was '{raw_roll}' (roster roll {key[1]})"
        elif best_roll:
            key = best_roll
            if raw_roll.strip() != str(key[1]):
                issue = f"roll field was '{raw_roll}'"
        elif name_exact:
            key = name_exact
            issue = f"roll field was '{raw_roll}' (roster roll {key[1]})"
        else:
            key = match_name(raw_name)
            if key:
                issue = f"roll field was '{raw_roll}' (roster roll {key[1]})"
            else:
                key = (sec, rolls[0] if rolls else None)
        if key in roster and key[0] != sec:
            issue = (issue + "; " if issue else "") + f"marked Section {sec}, roster Section {key[0]}"
        if swapped:
            issue = (issue + "; " if issue else "") + "name and roll-number fields were swapped"
        if key in roster and nname(raw_name) != nname(roster[key]) and \
           difflib.SequenceMatcher(None, nname(raw_name), nname(roster[key])).ratio() < 1.0:
            name_note = f"name recorded '{raw_name}', roster '{roster[key]}'"
        else:
            name_note = None
        events.append(dict(ts=r["Timestamp"], email=r["Email Address"].strip(), raw_name=raw_name,
                           raw_roll=raw_roll, sec=sec, key=key, issue=issue, name_note=name_note,
                           swapped=swapped, score=r.get("Score"), row=r))
    # dedupe: first submission per resolved person
    first = {}
    dupes = collections.defaultdict(list)
    for e in events:
        if e["key"] in roster:
            if e["key"] in first:
                dupes[e["key"]].append(e)
            else:
                first[e["key"]] = e
    unknown = [e for e in events if e["key"] not in roster]
    results[code] = dict(label=label, rows=len(rows), first=first, dupes=dupes,
                         unknown=unknown, events=events)

SECTIONS = "ABC"
print("# Assignment submission analysis\n")
for code, res in results.items():
    print(f"## {code} — {res['label']}  ({res['rows']} form responses)\n")
    print("| Section | Submitted | Roster | Missing | Submit % |")
    print("|---|---|---|---|---|")
    tot_sub = tot_roster = 0
    for s in SECTIONS:
        sub = sum(1 for k in res["first"] if k[0] == s)
        tot = sum(1 for k in roster if k[0] == s)
        tot_sub += sub; tot_roster += tot
        print(f"| {s} | {sub} | {tot} | {tot-sub} | {sub/tot*100:.1f}% |")
    print(f"| **Total** | **{tot_sub}** | **{tot_roster}** | **{tot_roster-tot_sub}** | **{tot_sub/tot_roster*100:.1f}%** |\n")
    for s in SECTIONS:
        miss = [f"{r}-{roster[(s,r)]}" for r in range(1, 60) if (s, r) in roster and (s, r) not in res["first"]]
        print(f"**Missing — Section {s} ({len(miss)}):** " + "; ".join(miss) + "\n")
    if res["dupes"]:
        print("**Duplicate submissions (same student):**")
        for k, v in res["dupes"].items():
            print(f"- {k[0]}{k[1]} {roster[k]}: " + " | ".join(f"{x['ts']} ({x['email']})" for x in [res['first'][k]] + v))
        print()
    if res["unknown"]:
        print("**Unmatched responses:**")
        for e in res["unknown"]:
            print(f"- {e['ts']} · '{e['raw_name']}' · roll '{e['raw_roll']}' · Sec {e['sec']} · {e['email']}")
        print()
    if res["dupes"] or res["unknown"] or any(e["issue"] or e["name_note"] for e in res["events"]):
        print("**Data discrepancies:**")
        for e in res["events"]:
            bits = [b for b in (e["issue"], e["name_note"]) if b]
            if bits:
                print(f"- {e['ts']} · {e['key'][0]}{e['key'][1] if e['key'][1] else '?'} {roster.get(e['key'], e['raw_name'])}: " + "; ".join(bits))
        print()

print("## When responses came in\n")
for code, res in results.items():
    days = collections.Counter(e["ts"].split(" ")[0] for e in res["events"])
    ordered = sorted(days.items(), key=lambda kv: __import__("datetime").datetime.strptime(kv[0], "%m/%d/%Y"))
    print(f"- **{code}:** " + ", ".join(f"{d} = {n}" for d, n in ordered))
print()

print("## Cross-assignment coverage\n")
print("| Section | Students | All 3 | Exactly 2 | Exactly 1 | None |")
print("|---|---|---|---|---|---|")
for s in SECTIONS:
    keys = [k for k in roster if k[0] == s]
    c = collections.Counter(sum(1 for res in results.values() if k in res["first"]) for k in keys)
    print(f"| {s} | {len(keys)} | {c[3]} | {c[2]} | {c[1]} | {c[0]} |")
keys = list(roster)
c = collections.Counter(sum(1 for res in results.values() if k in res["first"]) for k in keys)
print(f"| **Total** | **{len(keys)}** | **{c[3]}** | **{c[2]}** | **{c[1]}** | **{c[0]}** |\n")

print("## Students who missed every assignment\n")
for s in SECTIONS:
    z = [f"{k[1]}-{roster[k]}" for k in roster if k[0] == s and not any(k in r["first"] for r in results.values())]
    print(f"- **Section {s} ({len(z)}):** " + ("; ".join(z) if z else "none"))
print()

# quiz scores
print("## Quiz (A2) score by section\n")
print("| Section | Appeared | Avg /10 | 10 | 9 | 8 | 7 | 6 | 5 | 4 | 2 |")
print("|---|---|---|---|---|---|---|---|---|---|---|")
for s in SECTIONS:
    sc = [int(results["A2"]["first"][k]["score"].split("/")[0]) for k in results["A2"]["first"] if k[0] == s and results["A2"]["first"][k]["score"]]
    dist = collections.Counter(sc)
    cells = " | ".join(str(dist.get(n, 0)) for n in [10, 9, 8, 7, 6, 5, 4, 2])
    print(f"| {s} | {len(sc)} | {statistics.mean(sc):.2f} | {cells} |")
allsc = [int(e["score"].split("/")[0]) for k, e in results["A2"]["first"].items() if e["score"]]
print(f"| **Total** | **{len(allsc)}** | **{statistics.mean(allsc):.2f}** | " +
      " | ".join(str(collections.Counter(allsc).get(n, 0)) for n in [10, 9, 8, 7, 6, 5, 4, 2]) + " |\n")

# per-student matrix
with open("analysis/per_student_status.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["Section", "Roll", "Name", "A1 (Sep)", "A2 (Oct quiz)", "A2 score",
                "A3 (Nov)", "Assignments submitted"])
    for s in SECTIONS:
        for k in [k for k in roster if k[0] == s]:
            marks = ["Yes" if k in results[c]["first"] else "No" for c in ("A1", "A2", "A3")]
            sc = results["A2"]["first"].get(k, {}).get("score") or ""
            w.writerow([s, k[1], roster[k], marks[0], marks[1], sc, marks[2], marks.count("Yes")])
