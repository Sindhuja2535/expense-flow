import csv
import os
import subprocess
from collections import defaultdict
from datetime import datetime
from pathlib import Path

base = Path(__file__).parent
out_dir = base / "output"
out_dir.mkdir(exist_ok=True)

env = os.environ.copy()
env["MYSQL_PWD"] = env.get("MYSQL_PWD") or "Sindhuja_2535"

query = "SELECT e.id,e.user_id,e.amount,c.name AS category,e.date AS expense_date,e.description,e.notes FROM expenses e LEFT JOIN categories c ON c.id=e.category_id"

result = subprocess.run(
    ["mysql", "-u", "expenseflow_app", "-h", "localhost", "expenseflow", "-e", query, "--batch"],
    env=env,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

lines = [l for l in result.stdout.splitlines() if l.strip() and not l.strip().startswith("mysql:")]

rows = []
if lines:
    headers = lines[0].split('\t')
    for l in lines[1:]:
        parts = l.split('\t')
        rows.append(dict(zip(headers, parts)))

monthly = defaultdict(lambda: {'total': 0.0, 'count': 0})
for row in rows:
    try:
        d = datetime.strptime(row.get('expense_date',''), '%Y-%m-%d')
        key = d.strftime('%Y-%m')
        monthly[key]['total'] += float(row.get('amount') or 0)
        monthly[key]['count'] += 1
    except Exception:
        continue

monthly_path = out_dir / 'monthly_trends_db.csv'
with monthly_path.open('w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['month', 'total_spent', 'transactions', 'avg_expense'])
    for k in sorted(monthly):
        t = monthly[k]['total']
        c = monthly[k]['count']
        w.writerow([k, f'{t:.2f}', c, f'{(t/c if c else 0):.2f}'])

cat = defaultdict(lambda: {'total': 0.0, 'count': 0})
for row in rows:
    key = row.get('category') or 'Unknown'
    try:
        cat[key]['total'] += float(row.get('amount') or 0)
        cat[key]['count'] += 1
    except Exception:
        continue

cat_path = out_dir / 'category_trends_db.csv'
with cat_path.open('w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['category', 'total_spent', 'transactions'])
    for k,v in sorted(cat.items(), key=lambda x: x[1]['total'], reverse=True):
        w.writerow([k, f'{v["total"]:.2f}', v['count']])

print('Done - read directly from MySQL')
print('Monthly:', monthly_path)
print('Category:', cat_path)
