import { HttpInterceptorFn } from '@angular/common/http';

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

function decodeToken(token: string): string {
  try {
    return decodeURIComponent(token);
  } catch {
    return token;
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const csrfToken = getCookie('XSRF-TOKEN');

  const modifiedReq = req.clone({
    withCredentials: true,
    setHeaders: csrfToken ? {
      'X-XSRF-TOKEN': decodeToken(csrfToken)
    } : {}
  });

  return next(modifiedReq);
};
