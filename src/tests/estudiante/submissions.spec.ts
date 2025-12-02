import { test, expect } from '@playwright/test';
import { login } from '../all_users/helpers';
import { ESTUDIANTE_USER } from '../playwright.constants';

test('test', async ({ page }) => {
  await login(page, ESTUDIANTE_USER.mail, ESTUDIANTE_USER.password);
  await page.getByRole('link', { name: 'Mis Cursos', exact: true }).click();
  await page.getByRole('button', { name: 'Ver Detalles' }).nth(1).click();
  await page.getByRole('link', { name: 'Tareas' }).click();
  await page.locator('div').filter({ hasText: /^asdasdEn Fecha25\/11\/2025, 1:52:54 p\.m\.asdasdasd$/ }).nth(2).click();
  await page.getByRole('button', { name: 'Entregar' }).click();
  await page.getByRole('button', { name: 'Archivo' }).click();
  await page.getByRole('button', { name: 'Archivo' }).setInputFiles('submissions.txt');
  await page.getByRole('button', { name: 'Subir Recurso' }).click();
});