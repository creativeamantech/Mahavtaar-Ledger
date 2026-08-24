const fs = require('fs');
const file = 'src/contexts/AuthContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const updateUser = async \(id: string, data: Partial<User>\) => \{[\s\S]*?await db\.users\.update\(id, \{ \.\.\.existing, \.\.\.data \}\);\n    \}\n  \};/;

const replacement = `const updateUser = async (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    const existing = await db.users.get(id);
    if (existing) {
      await db.users.update(id, { ...existing, ...data });

      // If name changed, ripple it through the database
      if (data.name && data.name !== existing.name) {
          const oldName = existing.name;
          const newName = data.name;

          // 1. Update loan_records
          const recordsToUpdate = await db.loan_records.filter(r => r.executive_name === oldName || r['Executive Name'] === oldName).toArray();
          if (recordsToUpdate.length > 0) {
              const updatedRecords = recordsToUpdate.map(r => ({ ...r, executive_name: newName, ['Executive Name']: newName }));
              await db.loan_records.bulkPut(updatedRecords);
          }

          // 2. Update customer_feedbacks
          const feedbacksToUpdate = await db.customer_feedbacks.where('agentId').equals(id).toArray();
          if (feedbacksToUpdate.length > 0) {
              const updatedFeedbacks = feedbacksToUpdate.map(f => ({ ...f, agentName: newName }));
              await db.customer_feedbacks.bulkPut(updatedFeedbacks);
          }

          // 3. Update attendance_logs
          const attendanceToUpdate = await db.attendance_logs.where('userId').equals(id).toArray();
          if (attendanceToUpdate.length > 0) {
              const updatedAttendance = attendanceToUpdate.map(a => ({ ...a, userName: newName }));
              await db.attendance_logs.bulkPut(updatedAttendance);
          }
      }
    }
  };`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content, 'utf8');
