import { test, expect } from '@playwright/test';
import { login } from '../all_users/helpers';
import { PROFESOR_USER } from '../playwright.constants';

test('test', async ({ page }) => {
  await login(page, PROFESOR_USER.mail, PROFESOR_USER.password);
  await page.getByRole('link', { name: 'Mis Cursos', exact: true }).click();
  await page.getByRole('button', { name: 'Ver Detalles' }).nth(3).click();
  await page.getByRole('link', { name: 'Calificaciones' }).click();
  await page.getByRole('row', { name: 'Gaston Mosteiro BORRADOR' }).getByRole('spinbutton').click();
  await page.getByRole('row', { name: 'Gaston Mosteiro BORRADOR' }).getByRole('spinbutton').fill('10');
  await page.getByRole('row', { name: 'Gaston Mosteiro BORRADOR' }).getByRole('textbox').click();
  await page.getByRole('row', { name: 'Gaston Mosteiro 10 BORRADOR' }).getByRole('textbox').fill('Bien');
  await page.getByRole('link', { name: 'Mis Cursos' }).click();
  await page.getByRole('button', { name: 'Guardar Borrador' }).click();
  await page.getByRole('button', { name: 'Publicar calificaciones' }).click();
});