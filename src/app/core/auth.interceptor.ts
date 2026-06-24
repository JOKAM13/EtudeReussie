import { HttpInterceptorFn } from '@angular/common/http';

const TOKEN_STORAGE_KEY = 'etude-reussie-token';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (!token) {
    return next(request);
  }

  const authenticatedRequest = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authenticatedRequest);
};