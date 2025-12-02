import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login/');
  await page.getByRole('textbox', { name: 'Correo electrónico' }).click();
  await page.getByRole('textbox', { name: 'Correo electrónico' }).fill('prof1');
  await page.getByRole('textbox', { name: 'Correo electrónico' }).press('Alt+6');
  await page.getByRole('textbox', { name: 'Correo electrónico' }).press('Alt+4');
  await page.getByRole('textbox', { name: 'Correo electrónico' }).fill('prof1@ombook.com');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Test.1234');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await page.getByRole('link', { name: 'Mis Cursos', exact: true }).click();
  await page.getByRole('button', { name: 'Ver Detalles' }).nth(4).click();
  await page.getByRole('link', { name: 'Usuarios' }).click();
  await page.getByRole('button', { name: 'Acciones' }).click();
  await page.getByRole('button', { name: 'Matricular usuarios', exact: true }).click();
  await page.getByRole('button', { name: 'Masiva' }).click();
  await page.getByText('Sube un archivo').click();
  await page.locator('body').setInputFiles('matricula.csv');
  await page.getByRole('button', { name: 'Matricular Usuarios' }).click();
  await page.locator('body').press('ControlOrMeta+Shift+C');
});