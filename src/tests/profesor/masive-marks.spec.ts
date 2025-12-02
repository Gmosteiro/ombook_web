import { test } from '@playwright/test';
import { login } from '../all_users/helpers';
import { PROFESOR_USER } from '../playwright.constants';

test('test', async ({ page }) => {
  await login(page, PROFESOR_USER.mail, PROFESOR_USER.password);
  await page.getByRole('link', { name: 'Mis Cursos', exact: true }).click();
  await page.getByRole('button', { name: 'Ver Detalles' }).first().click();
  await page.getByRole('link', { name: 'Calificaciones' }).click();
  await page.getByRole('button', { name: 'Importar CSV' }).click();
  await page.getByRole('button', { name: 'Importar CSV' }).setInputFiles('calificaciones.csv');
  await page.getByText('Importados: 1 /').click();
});