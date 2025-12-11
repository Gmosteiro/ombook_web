import { expect, test } from '@playwright/test';
import { login } from '../all_users/helpers';
import { ADMIN_USER } from '../playwright.constants';

test('test', async ({ page }) => {
  await login(page, ADMIN_USER.mail, ADMIN_USER.password);
  await page.getByRole('link', { name: 'Usuarios', exact: true }).click();
  await page.getByRole('button', { name: 'Acciones' }).click();
  await page.getByRole('button', { name: 'Crear Usuario' }).click();
  await expect(page.locator('h2')).toContainText('Alta de Usuarios');
  await page.getByRole('textbox').first().click();
  await page.getByRole('textbox').first().fill('Juan');
  await page.getByRole('textbox').first().press('Tab');
  await page.getByRole('textbox').nth(1).fill('Pedro');
  await page.getByRole('textbox').nth(1).press('Tab');
  // Generar email y cédula aleatorios
  const randomNum = Math.floor(Math.random() * 1000000);
  const randomEmail = `juan${randomNum}@pedro.com`;
  const randomCedula = `${Math.floor(10000000 + Math.random() * 90000000)}`;
  await page.locator('input[type="email"]').fill(randomEmail);
  await page.locator('input[type="email"]').press('Tab');
  await page.getByRole('textbox', { name: '-8' }).fill(randomCedula);
  await page.locator('input[type="date"]').fill('2002-06-10');
  await page.getByRole('combobox').selectOption('ESTUDIANTE');
  await page.getByRole('button', { name: 'Crear Usuario' }).click();
  await page.getByText('Éxito: Usuario creado').click();
});