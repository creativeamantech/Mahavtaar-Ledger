import glob
import re

def fix(path):
    with open(path, 'r') as f:
        content = f.read()

    # Dashboard & ExecDashboard
    content = re.sub(r'\.map\(b\s*=>', r'.map((b, i) =>', content)
    content = re.sub(r'\.map\(c\s*=>', r'.map((c, i) =>', content)
    
    # Assignment
    content = re.sub(r'\.map\(stat\s*=>', r'.map((stat, i) =>', content)
    content = re.sub(r'\.map\(\(stat\)\s*=>', r'.map((stat, i) =>', content)
    content = re.sub(r'\.map\(execStat\s*=>', r'.map((execStat, i) =>', content)
    content = re.sub(r'\.map\(\(execStat\)\s*=>', r'.map((execStat, i) =>', content)

    # CityPivot, TeamPivot, ExecTeamPerf
    content = re.sub(r'\.map\(\(item:\s*any\)\s*=>', r'.map((item: any, i: number) =>', content)

    with open(path, 'w') as f:
        f.write(content)

for f in glob.glob('src/pages/*.tsx'):
    fix(f)
