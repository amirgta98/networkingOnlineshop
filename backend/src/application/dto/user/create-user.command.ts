export interface CreateUserCommand {
  email: string;
  name: string;
  phone?: string | null;
  role?: string;
  status?: string;
  companyName?: string | null;
  nationalCode?: string | null;
  notes?: string | null;
  userTier?: 'gold' | 'silver' | 'bronze';
}
