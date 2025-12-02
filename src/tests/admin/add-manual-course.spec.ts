import { test } from '@playwright/test';
import { login } from '../all_users/helpers';
import { ADMIN_USER } from '../playwright.constants';

test('test', async ({ page }) => {
  await login(page, ADMIN_USER.mail, ADMIN_USER.password);
  await page.getByRole('navigation').getByRole('link', { name: 'Cursos' }).click();
  await page.getByRole('button', { name: 'Acciones' }).click();
  await page.getByRole('button', { name: 'Crear Curso' }).click();
  await page.getByRole('textbox', { name: 'Nombre del Curso *' }).click();
  await page.getByRole('textbox', { name: 'Nombre del Curso *' }).fill('Curso');
  await page.getByRole('textbox', { name: 'Nombre del Curso *' }).press('Tab');
  await page.getByRole('textbox', { name: 'Código del Curso *' }).fill('CUR' + Math.floor(Math.random() * 10000));
  await page.getByRole('textbox', { name: 'Código del Curso *' }).press('Tab');
  await page.getByRole('textbox', { name: 'Descripción *' }).fill('Descripcion de curso');
  await page.getByLabel('Semestre').selectOption('1');
  await page.locator('label').filter({ hasText: 'Shoshanna Rodríguez' }).click();
  await page.getByRole('button', { name: 'Crear Curso' }).click();
  await page.getByText('Éxito: Curso creado').click();
});