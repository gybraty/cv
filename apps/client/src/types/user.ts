export interface UserProfile {
  fullName?: string;
  avatarUrl?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  onboardingCompleted: boolean;
}

export interface User {
  _id: string;
  supabaseId: string;
  email: string;
  profile: UserProfile;
  settings: UserSettings;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserDto {
  profile?: UserProfile;
  settings?: Partial<UserSettings>;
}
