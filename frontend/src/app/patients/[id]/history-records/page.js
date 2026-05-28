'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  FileText,
  Phone,
  UserRound,
} from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import { useAuth } from '@/context/AuthContext';

const formatDateTime = (value) => {
  if (!value) return 'Not scheduled';

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export default function PatientHistoryRecordsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token, loading: authLoading, API_BASE_URL } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (authLoading || !user || !token || !id) return;

    const controller = new AbortController();

    const fetchPatient = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load patient record.');
        }

        setPatient(data);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPatient();

    return () => controller.abort();
  }, [API_BASE_URL, authLoading, id, token, user]);

  const clinicalSummary = useMemo(() => {
    const history = patient?.medicalHistory?.trim();
    return history || 'No medical history recorded.';
  }, [patient]);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 sm:p-8 space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {loading ? (
          <div className="glass p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="pulse-loader mx-auto">
              <div></div>
              <div></div>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-400">Loading clinical record...</p>
          </div>
        ) : error ? (
          <div className="p-5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        ) : patient ? (
          <>
            <section className="glass p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-extrabold uppercase tracking-wider border border-teal-500/20 mb-4">
                    <ClipboardList className="h-3.5 w-3.5" />
                    Clinical History Record
                  </div>
                  <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">{patient.name}</h1>
                  <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Patient ID: <span className="font-mono">{patient.id}</span>
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 text-sm">
                  <div className="p-4 rounded-xl bg-slate-500/5 border border-slate-200 dark:border-slate-800">
                    <UserRound className="h-4 w-4 text-teal-600 dark:text-teal-400 mb-2" />
                    <span className="block text-xxs uppercase tracking-wider text-slate-400 font-bold">Age / Sex</span>
                    <strong className="text-slate-800 dark:text-slate-100">{patient.age} / {patient.gender}</strong>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-500/5 border border-slate-200 dark:border-slate-800">
                    <Phone className="h-4 w-4 text-teal-600 dark:text-teal-400 mb-2" />
                    <span className="block text-xxs uppercase tracking-wider text-slate-400 font-bold">Contact</span>
                    <strong className="text-slate-800 dark:text-slate-100">{patient.phoneNumber}</strong>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-500/5 border border-slate-200 dark:border-slate-800">
                    <Activity className="h-4 w-4 text-teal-600 dark:text-teal-400 mb-2" />
                    <span className="block text-xxs uppercase tracking-wider text-slate-400 font-bold">Appointments</span>
                    <strong className="text-slate-800 dark:text-slate-100">{patient.appointments?.length || 0}</strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Clinical Background</h2>
                </div>
                <p className="text-sm leading-7 text-slate-700 dark:text-slate-300 font-semibold whitespace-pre-wrap">
                  {clinicalSummary}
                </p>
              </div>

              <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
                <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mb-4">Demographics</h2>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xxs uppercase tracking-wider text-slate-400 font-bold">Email</dt>
                    <dd className="font-semibold text-slate-700 dark:text-slate-300">{patient.email || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-xxs uppercase tracking-wider text-slate-400 font-bold">Registered</dt>
                    <dd className="font-semibold text-slate-700 dark:text-slate-300">{formatDateTime(patient.createdAt)}</dd>
                  </div>
                </dl>
              </div>
            </section>

            <section className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Appointment Timeline</h2>
              </div>

              {patient.appointments?.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm text-left">
                    <thead>
                      <tr className="text-slate-400 uppercase tracking-widest text-xxs font-bold border-b border-slate-200 dark:border-slate-800">
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Reason</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {patient.appointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200">
                            {formatDateTime(appointment.appointmentDate)}
                          </td>
                          <td className="py-3.5 text-slate-500 dark:text-slate-400 font-medium">
                            {appointment.reason || 'None provided'}
                          </td>
                          <td className="py-3.5 text-right">
                            <span className="inline-flex px-2 py-0.5 rounded text-xxs font-extrabold tracking-wide uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {appointment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-400 font-semibold">No appointments recorded for this patient.</p>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
