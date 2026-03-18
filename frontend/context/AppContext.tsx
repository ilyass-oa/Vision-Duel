import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ScreenStage, ActivityImage, TestScores } from '../types';
import { fetchAllImages, fetchLookAlikeImages, fetchTrainingSamples, TrainingSample } from '../api';
import { TEST_1_COUNT, TEST_2_COUNT, TEST_3_COUNT } from '../constants';

interface AppContextProps {
    stage: ScreenStage;
    setStage: (stage: ScreenStage) => void;
    completedTests: Set<string>;
    setCompletedTests: React.Dispatch<React.SetStateAction<Set<string>>>;

    allImages: ActivityImage[];
    test1Images: ActivityImage[];
    test2Images: ActivityImage[];
    test3Images: ActivityImage[];
    labImages: ActivityImage[];
    trainingSamplesA: TrainingSample[];
    trainingSamplesB: TrainingSample[];

    test1Scores: TestScores;
    setTest1Scores: React.Dispatch<React.SetStateAction<TestScores>>;
    test2Scores: TestScores;
    setTest2Scores: React.Dispatch<React.SetStateAction<TestScores>>;
    test3Scores: TestScores;
    setTest3Scores: React.Dispatch<React.SetStateAction<TestScores>>;

    switchTest: (targetStage: ScreenStage) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [stage, setStage] = useState<ScreenStage>('WELCOME');
    const [completedTests, setCompletedTests] = useState<Set<string>>(new Set());

    const [allImages, setAllImages] = useState<ActivityImage[]>([]);
    const [test1Images, setTest1Images] = useState<ActivityImage[]>([]);
    const [test2Images, setTest2Images] = useState<ActivityImage[]>([]);
    const [test3Images, setTest3Images] = useState<ActivityImage[]>([]);
    const [labImages, setLabImages] = useState<ActivityImage[]>([]);
    const [trainingSamplesA, setTrainingSamplesA] = useState<TrainingSample[]>([]);
    const [trainingSamplesB, setTrainingSamplesB] = useState<TrainingSample[]>([]);

    const initialScores: TestScores = { humanCorrect: 0, humanTotal: 0, modelACorrect: 0, modelATotal: 0, modelBCorrect: 0, modelBTotal: 0 };
    const [test1Scores, setTest1Scores] = useState<TestScores>(initialScores);
    const [test2Scores, setTest2Scores] = useState<TestScores>(initialScores);
    const [test3Scores, setTest3Scores] = useState<TestScores>(initialScores);

    useEffect(() => {
        fetchAllImages()
            .then(images => {
                setAllImages(images);
                const shuffled = [...images].sort(() => Math.random() - 0.5);
                const n = shuffled.length;
                const t1End = Math.min(TEST_1_COUNT, n);
                const t2End = Math.min(t1End + TEST_2_COUNT, n);
                setTest1Images(shuffled.slice(0, t1End));
                setTest2Images(shuffled.slice(t1End, t2End));
                setLabImages(shuffled.slice(0, Math.min(4, shuffled.length)));
            })
            .catch(err => console.error("Failed to load images:", err));

        fetchLookAlikeImages()
            .then(imgs => {
                const shuffled = [...imgs].sort(() => Math.random() - 0.5);
                setTest3Images(shuffled.slice(0, Math.min(TEST_3_COUNT, shuffled.length)));
            })
            .catch(err => console.error("Failed to load lookalike images:", err));

        fetchTrainingSamples()
            .then(data => {
                setTrainingSamplesA(data.model_a);
                setTrainingSamplesB(data.model_b);
            })
            .catch(err => console.error("Failed to load training samples:", err));
    }, []);

    const switchTest = (targetStage: ScreenStage) => {
        if (stage === targetStage) return;
        setStage(targetStage);
    };

    return (
        <AppContext.Provider value={{
            stage, setStage, completedTests, setCompletedTests,
            allImages, test1Images, test2Images, test3Images, labImages,
            trainingSamplesA, trainingSamplesB,
            test1Scores, setTest1Scores, test2Scores, setTest2Scores, test3Scores, setTest3Scores,
            switchTest
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
