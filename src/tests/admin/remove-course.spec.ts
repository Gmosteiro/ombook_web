import { test } from '@playwright/test';
import { login } from '../all_users/helpers';
import { ADMIN_USER } from '../playwright.constants';

test('test', async ({ page }) => {
  await login(page, ADMIN_USER.mail, ADMIN_USER.password);
  await page.getByRole('navigation').getByRole('link', { name: 'Cursos' }).click();
  await page.getByRole('button', { name: 'Acciones' }).click();
  await page.getByRole('button', { name: 'Eliminar Masivo' }).click();
  await page.getByText('Sube un archivo').click();
  await page.getByText('HomeUsuariosCursosAuditoriaMi PerfilCerrar SesiónBaja de CursosSelecciona el').setInputFiles('cursos-baja.csv');
  await page.getByRole('button', { name: 'Eliminar Cursos' }).click();
  await page.getByText('Éxito: Cursos eliminados: 1').click();
});