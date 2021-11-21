import { useEffect, useState } from 'react'
import * as R from 'ramda'

import { useRequireAdmin } from 'utils/authHooks'
import { supabase } from 'utils/supabaseClient'

export default function AuditLogs() {
  useRequireAdmin()
  /**
   * @typedef AuditLog
   * @property {string} id
   * @property {string} created_at
   * @property {object} user
   * @property {string} user.email
   * @property {string} operation
   * @property {object} data
   *
   */
  const [auditLogs, setAuditLogs] = useState(/** @type {AuditLog[]} */ ([]))

  useEffect(() => {
    supabase
      .from('audit_logs')
      .select(
        `
          created_at,
          user (email),
          operation,
          data
        `
      )
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setAuditLogs(data)
        }
      })
  }, [])
  return (
    <div className="container mx-auto pt-4">
      <h1 className="font-semibold text-lg">Audit logs</h1>
      <div className="overflow-x-auto">
        <table className="w-full mt-4">
          <thead>
            <tr>
              <th className="pb-2 font-semibold">Datetime</th>
              <th className="pb-2 font-semibold">User</th>
              <th className="pb-2 font-semibold">Operation</th>
              <th className="pb-2 font-semibold">Data</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((auditLog) => {
              return (
                <tr key={auditLog.id}>
                  <td className="px-3 py-2 border border-gray-400">
                    {new Intl.DateTimeFormat('en-gb', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      weekday: 'short',
                      hour: 'numeric',
                      minute: 'numeric',
                      second: 'numeric',
                    }).format(new Date(auditLog.created_at))}
                  </td>
                  <td className="px-3 py-2 border border-gray-400">{auditLog.user?.email}</td>
                  <td className="px-3 py-2 border border-gray-400 capitalize">
                    {auditLog.operation.toLowerCase()}
                  </td>
                  <td className="px-3 py-2 border border-gray-400">
                    {JSON.stringify(R.pick(['name', 'quantity'], auditLog.data))}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
