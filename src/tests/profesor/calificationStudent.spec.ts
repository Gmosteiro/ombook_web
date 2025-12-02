import { test, expect } from '@playwright/test';
import { login } from '../all_users/helpers';
import { PROFESOR_USER } from '../playwright.constants';

test('test', async ({ page }) => {
  await login(page, PROFESOR_USER.mail, PROFESOR_USER.password);
  await page.getByRole('link', { name: 'Mis Cursos', exact: true }).click();
  await page.getByRole('button', { name: 'Ver Detalles' }).nth(2).click();
  await page.getByRole('link', { name: 'Calificaciones' }).click();
  await page.locator('tr:nth-child(9) > td:nth-child(2) > .ombook-input').click();
  await page.locator('tr:nth-child(9) > td:nth-child(2) > .ombook-input').fill('8');
  await page.locator('tr:nth-child(9) > td:nth-child(3) > .ombook-input').click();
  await page.locator('tr:nth-child(9) > td:nth-child(3) > .ombook-input').fill('Muy bien, Posibilidad a mejorar');
  await page.getByRole('button', { name: 'Guardar Borrador' }).click();
  await page.getByRole('button', { name: 'Publicar calificaciones' }).click();
});