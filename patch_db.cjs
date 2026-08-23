const fs = require('fs');
let code = fs.readFileSync('src/lib/db.ts', 'utf8');

const interfaceFeedback = `
export interface CustomerFeedback {
  id: string;
  agreementid: string;
  contactNumber: string;
  availability: string;
  status: string;
  paidSubStatus?: string;
  amountPaid?: number;
  paymentMode?: string;
  approvedAmount?: number;
  nonContactableSubStatus?: string;
  ptpDate?: string;
  cbDate?: string;
  detailedFeedback?: string;
  detailedFeedbackThirdParty?: string;
  detailedFeedbackAgentDispute?: string;
  overallDetailedFeedback?: string;
  concernNumber?: string;
  relationName?: string;
  agentId: string;
  agentName: string;
  createdAt: string;
}
`;

if(!code.includes('export interface CustomerFeedback')) {
    code = code.replace("export interface UploadSession", interfaceFeedback + "export interface UploadSession");
    
    code = code.replace("state_targets!: Table<StateTarget, string>;", "state_targets!: Table<StateTarget, string>;\n  customer_feedbacks!: Table<CustomerFeedback, string>;");
    
    code = code.replace(
        "this.version(1).stores({",
        "this.version(2).stores({\n      customer_feedbacks: 'id, agreementid, createdAt',\n"
    ).replace("this.version(1).stores({", "this.version(2).stores({");
}

fs.writeFileSync('src/lib/db.ts', code);
