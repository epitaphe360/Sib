import { supabase } from '../lib/supabase';

export type VisaStatus = 'pending' | 'approved' | 'rejected';

export interface VisaRequest {
  id: string;
  firstName: string;
  lastName: string;
  passportNumber: string;
  nationality: string;
  status: VisaStatus;
  rejectionReason: string | null;
  createdAt: string;
}

export interface VisaFormInput {
  firstName: string;
  lastName: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth?: string;
  organization?: string;
  jobTitle?: string;
  address?: string;
}

export async function fetchVisaRequest(userId: string): Promise<VisaRequest | null> {
  const { data, error } = await supabase
    .from('visa_invitation_requests')
    .select('id, first_name, last_name, passport_number, nationality, status, rejection_reason, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (error.code === '42P01') return null;
    throw error;
  }
  if (!data) return null;

  return {
    id: data.id as string,
    firstName: data.first_name as string,
    lastName: data.last_name as string,
    passportNumber: data.passport_number as string,
    nationality: data.nationality as string,
    status: (data.status as VisaStatus) ?? 'pending',
    rejectionReason: (data.rejection_reason as string) ?? null,
    createdAt: data.created_at as string,
  };
}

export async function submitVisaRequest(userId: string, email: string, form: VisaFormInput): Promise<void> {
  const { error } = await supabase.from('visa_invitation_requests').insert({
    user_id: userId,
    user_email: email,
    first_name: form.firstName.trim(),
    last_name: form.lastName.trim(),
    passport_number: form.passportNumber.trim(),
    nationality: form.nationality.trim(),
    date_of_birth: form.dateOfBirth ?? null,
    organization: form.organization ?? null,
    job_title: form.jobTitle ?? null,
    address: form.address ?? null,
    status: 'pending',
  });

  if (error) throw error;
}
