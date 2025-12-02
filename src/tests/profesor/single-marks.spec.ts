import { test } from '@playwright/test';
import { login } from '../all_users/helpers';
import { PROFESOR_USER } from '../playwright.constants';

test('test', async ({ page }) => {
  await login(page, PROFESOR_USER.mail, PROFESOR_USER.password);
  await page.getByRole('link', { name: 'Mis Cursos', exact: true }).click();
  await page.getByRole('button', { name: 'Ver Detalles' }).nth(1).click();
  await page.getByRole('link', { name: 'Calificaciones' }).click();
  await page.getByRole('row', { name: 'Acosta Barboza Angelina' }).getByRole('spinbutton').click();
  await page.getByRole('row', { name: 'Acosta Barboza Angelina' }).getByRole('spinbutton').fill('10');
  await page.getByRole('row', { name: 'Acosta Barboza Angelina' }).getByRole('textbox').click();
  await page.getByRole('row', { name: 'Acosta Barboza Angelina' }).getByRole('textbox').fill('Aprobado');
  await page.getByRole('button', { name: 'Guardar Borrador' }).click();
  await page.getByText('Calificaciones guardadas').click();
  await page.getByRole('button', { name: 'Publicar calificaciones' }).click();
  await page.getByText('Calificaciones publicadas y').click();
});