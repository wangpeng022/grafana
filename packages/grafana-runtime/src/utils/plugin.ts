/// <reference types="systemjs" />
import { config } from '../config';
import 'systemjs/dist/system';
import 'systemjs/dist/extras/amd';
import 'systemjs/dist/extras/named-exports';

export interface PluginCssOptions {
  light: string;
  dark: string;
}

// @ts-ignore
export const SystemJS = self.System as System;

export function loadPluginCss(options: PluginCssOptions): Promise<any> {
  const theme = config.bootData.user.lightTheme ? options.light : options.dark;
  return SystemJS.import(theme);
}
