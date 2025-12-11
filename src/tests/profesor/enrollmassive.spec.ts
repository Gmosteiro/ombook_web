import { test, expect } from '@playwright/test';
import { login } from '../all_users/helpers';
import { PROFESOR_USER } from '../playwright.constants';

test('test', async ({ page }) => {
  await login(page, PROFESOR_USER.mail, PROFESOR_USER.password);
  await page.getByRole('link', { name: 'Mis Cursos', exact: true }).click();
  await page.getByRole('button', { name: 'Ver Detalles' }).nth(4).click();
  await page.getByRole('link', { name: 'Usuarios' }).click();
  await page.getByRole('button', { name: 'Acciones' }).click();
  await page.getByRole('button', { name: 'Matricular usuarios', exact: true }).click();
  await page.getByRole('button', { name: 'Masiva' }).click();
  const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 10000 });
  
  // Hacer clic en "Sube un archivo" para abrir el diálogo
  await page.getByText('Sube un archivo').click();
  
  // Esperar a que se abra el filechooser y capturarlo
  const fileChooser = await fileChooserPromise;
  
  // Establecer el archivo matricular.csv en el filechooser
  await fileChooser.setFiles('public/plantillas/matricular.csv');
  
  // Esperar a que se procese el archivo
  await page.waitForTimeout(2000);
  
  // Hacer clic en el botón Matricular Usuarios
  await page.getByRole('button', { name: 'Matricular Usuarios' }).click();
});