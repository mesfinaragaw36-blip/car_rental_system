interface Props {
    className?: string;
}

export default function AppLogoIcon({ className }: Props) {
    return (
        <img
            src="/images/logo.png"
            alt=""
            className={`rounded-xl object-cover ${className ?? 'size-9'}`}
        />
    );
}
