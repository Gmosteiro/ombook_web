import { test } from '@playwright/test';
import { login } from '../all_users/helpers';
import { ADMIN_USER } from '../playwright.constants';

test('test', async ({ page }) => {
  await login(page, ADMIN_USER.mail, ADMIN_USER.password);
  await page.getByRole('link', { name: 'Mis Cursos', exact: true }).click();
  await page.getByRole('button', { name: 'Ver Detalles' }).nth(4).click();
  await page.getByRole('link', { name: 'Usuarios' }).click();
  await page.getByRole('button', { name: 'Acciones' }).click();
  await page.getByRole('button', { name: 'Matricular usuarios', exact: true }).click();
  await page.getByRole('button', { name: 'Masiva' }).click();
  await page.getByText('Sube un archivo').click();
  await page.locator('body').setInputFiles('matricula.csv');
  await page.getByRole('button', { name: 'Matricular Usuarios' }).click();
  await page.locator('body').press('ControlOrMeta+Shift+C');
});