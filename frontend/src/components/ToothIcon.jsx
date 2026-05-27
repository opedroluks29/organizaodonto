/**
 * ToothIcon.jsx — Logo minimalista do Organiza Odonto
 */
export default function ToothIcon({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Corpo do dente */}
      <path
        d="M8.5 3.5C7.2 3.5 5.5 4.8 5.5 6.8C5.5 8 6 9 6 10.5C6 15.5 7 21 9.2 21C10 21 10.5 20.2 10.8 18.8C11.2 17 11.5 16 12 16C12.5 16 12.8 17 13.2 18.8C13.5 20.2 14 21 14.8 21C17 21 18 15.5 18 10.5C18 9 18.5 8 18.5 6.8C18.5 4.8 16.8 3.5 15.5 3.5C14.5 3.5 13.5 4 12 4C10.5 4 9.5 3.5 8.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Detalhe: linha central (sulco) */}
      <path
        d="M12 4C12 7 12 10 12 16"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="1.5 2"
        opacity="0.5"
      />
    </svg>
  );
}
