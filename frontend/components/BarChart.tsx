import React from 'react';

interface BarChartProps {
    label: string;
    trainScore: number;
    testScore: number;
    trainColor: string;
    testColor: string;
    tagline: string;
}

export const BarChart: React.FC<BarChartProps> = ({
    label, trainScore, testScore, trainColor, testColor, tagline
}) => (
    <div className="space-y-4">
        <h4 className="font-black uppercase text-center text-lg">{label}</h4>
        <div>
            <div className="flex justify-between text-xs font-mono mb-1">
                <span>Score entraînement</span>
                <span className="font-bold">{trainScore.toFixed(1)}%</span>
            </div>
            <div className="h-6 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                <div className={`h-full ${trainColor} rounded-full animate-fill`} style={{ width: `${trainScore}%` }}></div>
            </div>
        </div>
        <div>
            <div className="flex justify-between text-xs font-mono mb-1">
                <span>Score test (nouveau)</span>
                <span className={`font-bold ${testScore < 80 ? 'text-red-600' : 'text-green-700'}`}>{testScore.toFixed(1)}%</span>
            </div>
            <div className="h-6 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                <div className={`h-full ${testColor} rounded-full animate-fill`} style={{ width: `${testScore}%` }}></div>
            </div>
        </div>
        <p className="text-xs text-gray-500 font-mono italic text-center">{tagline}</p>
    </div>
);
