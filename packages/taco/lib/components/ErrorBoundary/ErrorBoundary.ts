import { MetaComponent } from '../../types';
import { useCatcher } from '../../hook';
import { Component } from '../../core';

interface ErrorBoundaryProps {
    onError?: (err: Error, source?: Component) => void;
}

export const ErrorBoundary: MetaComponent<ErrorBoundaryProps> = props => {
    const defaultOnError = (err: Error, source: Component) =>
        console.warn(err, source);
    useCatcher(props.onError || defaultOnError);
    return props.children;
};
