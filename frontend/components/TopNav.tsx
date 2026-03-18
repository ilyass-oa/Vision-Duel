import React from 'react';
import { useAppContext } from '../context/AppContext';

interface TopNavProps {
    isLocked?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({ isLocked = false }) => {
    const { stage, switchTest, completedTests } = useAppContext();

    const activeTest = stage === 'TEST_1_DUEL' || stage === 'RESULT_1' ? 'TEST_1_DUEL'
        : stage === 'TEST_2_STRESS' || stage === 'RESULT_2' ? 'TEST_2_STRESS'
            : 'TEST_3_UNCERTAINTY';

    const getBtnClass = (btnStage: string) => {
        const isActive = activeTest === btnStage;
        const isDone = completedTests.has(btnStage);
        const isDisabled = isLocked || isDone;
        return `flex-1 max-w-[280px] py-1 font-mono text-sm font-bold uppercase rounded-sm border-2 transition-all ${isActive ? 'bg-black text-white border-black'
            : isDone ? 'bg-green-50 text-green-600 border-green-300'
                : 'bg-white text-gray-500 border-gray-300'
            } ${isDisabled && !isActive ? 'cursor-not-allowed' : !isActive ? 'hover:border-black hover:text-black cursor-pointer' : ''
            }`;
    };

    const canClick = (btnStage: string) => !isLocked && !completedTests.has(btnStage);

    return (
        <div className="bg-gray-100 border-b-2 border-black flex justify-center gap-3 px-6 py-1 relative z-40">
            <button
                onClick={() => canClick('TEST_1_DUEL') && switchTest('TEST_1_DUEL')}
                disabled={!canClick('TEST_1_DUEL')}
                className={getBtnClass('TEST_1_DUEL')}
            >
                {completedTests.has('TEST_1_DUEL') ? '✓' : '⚡'} 1. Rapidité
            </button>
            <button
                onClick={() => canClick('TEST_2_STRESS') && switchTest('TEST_2_STRESS')}
                disabled={!canClick('TEST_2_STRESS')}
                className={getBtnClass('TEST_2_STRESS')}
            >
                {completedTests.has('TEST_2_STRESS') ? '✓' : '🔲'} 2. Pixélisation
            </button>
            <button
                onClick={() => canClick('TEST_3_UNCERTAINTY') && switchTest('TEST_3_UNCERTAINTY')}
                disabled={!canClick('TEST_3_UNCERTAINTY')}
                className={getBtnClass('TEST_3_UNCERTAINTY')}
            >
                {completedTests.has('TEST_3_UNCERTAINTY') ? '✓' : '❓'} 3. Faux Amis
            </button>
        </div>
    );
};
