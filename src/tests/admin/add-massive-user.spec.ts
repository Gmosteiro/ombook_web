import { test } from '@playwright/test';
import { login } from '../all_users/helpers';
import { ADMIN_USER } from '../playwright.constants';

test('test', async ({ page }) => {
  await login(page, ADMIN_USER.mail, ADMIN_USER.password);
  await page.getByRole('link', { name: 'Usuarios', exact: true }).click();
  await page.getByRole('button', { name: 'Acciones' }).click();
  await page.getByRole('button', { name: 'Crear Usuario' }).click();
  await page.getByRole('button', { name: 'Masiva' }).click();
  await page.getByText('Sube un archivo').click();
  await page.getByText('HomeUsuariosCursosAuditoriaMi PerfilCerrar SesiónAlta de UsuariosSelecciona la').setInputFiles('usuarios.csv');
  await page.getByRole('button', { name: 'Importar Usuarios' }).click();
  await page.getByText('Éxito: Usuarios importados: 1').click();
});