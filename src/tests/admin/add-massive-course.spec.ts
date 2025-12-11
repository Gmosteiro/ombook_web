import { test } from '@playwright/test';
import { login } from '../all_users/helpers';
import { ADMIN_USER } from '../playwright.constants';

test('test', async ({ page }) => {
  await login(page, ADMIN_USER.mail, ADMIN_USER.password);
  await page.getByRole('navigation').getByRole('link', { name: 'Cursos' }).click();
  await page.getByRole('button', { name: 'Acciones' }).click();
  await page.getByRole('button', { name: 'Crear Curso' }).click();
  await page.getByRole('button', { name: 'Masiva' }).click();
  await page.getByText('Sube un archivo').click();
  await page.getByText('HomeUsuariosCursosAuditoriaMi PerfilCerrar SesiónAlta de CursosSelecciona la').setInputFiles('cursos-alta.csv');
  await page.getByRole('button', { name: 'Importar Cursos' }).click();
  await page.getByText('Éxito: Cursos importados: 2').click();
});