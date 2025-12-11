import { expect, test } from '@playwright/test';
import { login } from '../all_users/helpers';
import { ADMIN_USER } from '../playwright.constants';

test('test', async ({ page }) => {
  await login(page, ADMIN_USER.mail, ADMIN_USER.password);
  await page.getByRole('navigation').getByRole('link', { name: 'Cursos' }).click();
  await page.getByRole('button', { name: 'Acciones' }).click();
  await page.getByRole('button', { name: 'Crear Curso' }).click();
  await expect(page.locator('h2')).toContainText('Alta de Cursos');
  await page.getByRole('textbox', { name: 'Nombre del Curso *' }).click();
  const randomNum = Math.floor(Math.random() * 1000000);
  await page.getByRole('textbox', { name: 'Nombre del Curso *' }).fill('Curso '+randomNum);
  await page.getByRole('textbox', { name: 'Código del Curso *' }).click();
  await page.getByRole('textbox', { name: 'Código del Curso *' }).click();
  await page.getByRole('textbox', { name: 'Código del Curso *' }).fill('Curs' + randomNum.toString());
  await page.getByRole('textbox', { name: 'Descripción *' }).click();
  await page.getByRole('textbox', { name: 'Descripción *' }).fill('Curso numero: ' + randomNum.toString());
  await page.getByLabel('Semestre').selectOption('1');
  await page.getByRole('checkbox', { name: 'Juan Pablo Sales' }).check();
  await page.getByRole('button', { name: 'Crear Curso' }).click();
  await expect(page.locator('section')).toContainText('Éxito: Curso creado exitosamente');
});