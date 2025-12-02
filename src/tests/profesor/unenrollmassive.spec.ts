import { test, expect } from '@playwright/test';
import { login } from '../all_users/helpers';
import { PROFESOR_USER } from '../playwright.constants';

test('test', async ({ page }) => {
  await login(page, PROFESOR_USER.mail, PROFESOR_USER.password);
  await page.getByRole('link', { name: 'Mis Cursos', exact: true }).click();
  await page.getByRole('button', { name: 'Ver Detalles' }).nth(4).click();
  await page.getByRole('link', { name: 'Usuarios' }).click();
  await page.getByRole('button', { name: 'Acciones' }).click();
  await page.getByRole('button', { name: 'Desmatricular usuarios' }).click();
  await page.getByRole('button', { name: 'Masiva' }).click();
  await page.getByText('Sube un archivo').click();
  await page.locator('body').setInputFiles('matricular.csv');
  await page.getByRole('button', { name: 'Desmatricular Usuarios' }).click();
});