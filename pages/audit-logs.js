import { useRequireAdmin } from 'utils/authHooks'

export default function AuditLogs() {
  useRequireAdmin()

  return <h1 className="font-semibold text-lg">Audit logs</h1>
}
