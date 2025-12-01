import { test } from '@playwright/test';
import { login } from './helpers';
import { ESTUDIANTE_USER } from '../playwright.constants';

test('test', async ({ page }) => {

    await login(page, ESTUDIANTE_USER.mail, ESTUDIANTE_USER.password);
    await page.getByRole('link', { name: 'Mis Cursos', exact: true }).click();
    await page.getByRole('button', { name: 'Ver Detalles' }).nth(1).click();
    await page.getByText('Información GeneralDescripció').click();
    await page.getByRole('link', { name: 'Tareas' }).click();
    await page.getByRole('link', { name: 'Foro' }).click();
    await page.getByRole('link', { name: 'Anuncios' }).click();
    await page.getByRole('link', { name: 'Usuarios' }).click();
    await page.getByRole('link', { name: 'Calificaciones' }).click();
});