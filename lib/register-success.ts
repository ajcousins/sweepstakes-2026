export type RegisterSuccessPayload = {
  team_a: string;
  team_b: string;
  goodluck_message: string | null;
};

const REGISTER_SUCCESS_KEY = 'sweepstakes_register_success';

export function saveRegisterSuccess(payload: RegisterSuccessPayload) {
  sessionStorage.setItem(REGISTER_SUCCESS_KEY, JSON.stringify(payload));
}

export function loadRegisterSuccess(): RegisterSuccessPayload | null {
  const raw = sessionStorage.getItem(REGISTER_SUCCESS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RegisterSuccessPayload;
  } catch {
    return null;
  }
}

export function clearRegisterSuccess() {
  sessionStorage.removeItem(REGISTER_SUCCESS_KEY);
}
