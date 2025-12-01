import { test } from '@playwright/test';
import { login } from './helpers';
import { ESTUDIANTE_USER } from '../playwright.constants';
import { WEB_PAGE } from '../playwright.constants';

test('test', async ({ page }) => {
    login(page, ESTUDIANTE_USER.mail, ESTUDIANTE_USER.password);
    await page.getByRole('link', { name: 'Mis Cursos', exact: true }).click();
    await page.getByRole('combobox').selectOption('ACTIVO');
    await page.goto(`${WEB_PAGE}/courses?status=ACTIVO&page=0`);
    await page.getByRole('combobox').selectOption('INACTIVO');
    await page.goto(`${WEB_PAGE}/courses?status=INACTIVO&page=0`);
    await page.getByRole('combobox').selectOption('ACTIVO');
    await page.goto(`${WEB_PAGE}/courses?status=ACTIVO&page=0`);
    await page.getByRole('button', { name: 'Ver Detalles' }).first().click();
});