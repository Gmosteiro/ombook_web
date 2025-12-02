import { test, expect } from '@playwright/test';
import { login } from '../all_users/helpers';
import { PROFESOR_USER } from '../playwright.constants';

test('test', async ({ page }) => {
  await login(page, PROFESOR_USER.mail, PROFESOR_USER.password);
  await page.getByRole('link', { name: 'Mis Cursos', exact: true }).click();
  await page.getByRole('button', { name: 'Ver Detalles' }).nth(1).click();
  await page.getByRole('link', { name: 'Usuarios' }).click();
  await page.getByRole('button', { name: 'Acciones' }).click();
  await page.getByRole('button', { name: 'Desmatricular usuarios' }).click();
  await page.getByRole('textbox', { name: 'Ej: Juan, juan@mail.com,' }).click();
  await page.getByRole('textbox', { name: 'Ej: Juan, juan@mail.com,' }).fill('Gaston');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByText('Gaston Mosteiro').click();
  await page.getByRole('button', { name: 'Desmatricular usuario' }).click();
});