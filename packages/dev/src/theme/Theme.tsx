import { useEffect, useMemo, useState, ReactNode } from 'react';
import { ThemeProvider, createTheme, useColorScheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';
import { inputsCustomizations } from './customizations/inputs';
import { dataDisplayCustomizations } from './customizations/dataDisplay';
import { feedbackCustomizations } from './customizations/feedback';
import { navigationCustomizations } from './customizations/navigation';
import { surfacesCustomizations } from './customizations/surfaces';
import { colorSchemes, typography, shadows, shape } from './themePrimitives';
import { SnackbarProvider } from 'notistack';
import "./theme.css";

const THEME_MODE_STORAGE_KEY = 'theme-mode';

interface Props {
	children: ReactNode;
	themeComponents?: ThemeOptions['components'];
}

export default function Theme({ children, themeComponents }: Props) {

	const [mounted, setMounted] = useState(false);
	const [mode, setMode] = useState<'light' | 'dark'>('light');

	const theme = useMemo(() => {
		const palette = colorSchemes['light']?.palette ?? colorSchemes.light.palette;
		const customShadows = shadows['light'] ?? shadows.light;
		return createTheme({
			palette,
			cssVariables: {
				colorSchemeSelector: 'data-color-scheme',
				cssVarPrefix: 'template',
			},
			colorSchemes,
			typography,
			shadows: customShadows,
			shape,
			components: {
				...inputsCustomizations,
				...dataDisplayCustomizations,
				...feedbackCustomizations,
				...navigationCustomizations,
				...surfacesCustomizations,
				...themeComponents,
			},
		});
	}, [themeComponents]);

	useEffect(() => {
		let delay = setTimeout(() => {
			if (typeof window === 'undefined') return;
			const savedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY) as 'light' | 'dark' | null;
			if (!savedMode || savedMode !== 'light') {
				localStorage.setItem(THEME_MODE_STORAGE_KEY, "light");
			}
			setMounted(true);
		}, 100);
		return () => clearTimeout(delay);
	}, []);

	if (!mounted) return null;

	return (
		<ThemeProvider theme={theme} modeStorageKey={THEME_MODE_STORAGE_KEY} disableTransitionOnChange>
			<ThemeClient onResolvedMode={setMode}>
				<SnackbarProvider maxSnack={3}
					anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
					autoHideDuration={4000}
					preventDuplicate>
					{children}
				</SnackbarProvider>
			</ThemeClient>
		</ThemeProvider>
	);
}


type ThemeClientProps = {
	children: ReactNode;
	onResolvedMode: (mode: 'light' | 'dark') => void;
};
function ThemeClient({ children, onResolvedMode }: ThemeClientProps) {
	const { mode, systemMode } = useColorScheme();
	const resolvedMode = (mode ?? systemMode ?? 'light') as 'light' | 'dark';

	useEffect(() => {
		onResolvedMode(resolvedMode);
	}, [resolvedMode]);

	return <>{children}</>;
}
