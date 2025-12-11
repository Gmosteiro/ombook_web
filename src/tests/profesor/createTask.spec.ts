import { test } from '@playwright/test';
import { login } from '../all_users/helpers';
import { PROFESOR_USER } from '../playwright.constants';

test('test', async ({ page }) => {
  await login(page, PROFESOR_USER.mail, PROFESOR_USER.password);
  await page.getByRole('link', { name: 'Mis Cursos', exact: true }).click();
  await page.getByRole('button', { name: 'Ver Detalles' }).nth(3).click();
  await page.getByRole('link', { name: 'Tareas' }).click();
  await page.getByRole('button', { name: 'Crear Tarea' }).click();
  await page.getByRole('textbox', { name: 'Título' }).click();
  await page.getByRole('textbox', { name: 'Título' }).fill('Calculo 1');
  await page.getByRole('textbox', { name: 'Descripción' }).click();
  await page.getByRole('textbox', { name: 'Descripción' }).fill('Practico de Calculo 1');
  await page.getByRole('textbox', { name: 'Fecha inicio' }).click();
  await page.getByRole('textbox', { name: 'Fecha inicio' }).fill('2025-12-01T00:00');
  await page.getByRole('textbox', { name: 'Fecha fin' }).click();
  await page.getByRole('textbox', { name: 'Fecha fin' }).fill('2025-12-14T23:59');
  await page.getByRole('button', { name: 'Crear' }).click();
});