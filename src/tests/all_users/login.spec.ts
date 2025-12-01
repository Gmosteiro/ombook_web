import { test } from '@playwright/test';
import { login } from './helpers';
import { ESTUDIANTE_USER } from '../playwright.constants';

test('test', async ({ page }) => {
    await login(page, ESTUDIANTE_USER.mail, ESTUDIANTE_USER.password);
});