const { useState, useEffect, useMemo } = React;

// --- STYLING HELPERS ---
const getTierColor = (tier) => {
  switch (tier) {
    case 'legendary': return 'from-pink-500 to-rose-600 border-rose-400';
    case 'epic': return 'from-purple-600 to-indigo-700 border-purple-400';
    case 'rare': return 'from-orange-400 to-amber-600 border-orange-300';
    case 'common': return 'from-blue-400 to-cyan-600 border-blue-300';
    default: return 'from-slate-500 to-slate-700 border-slate-400';
  }
};
const getTierText = (tier) => {
  switch (tier) {
    case 'legendary': return 'text-pink-300';
    case 'epic': return 'text-purple-300';
    case 'rare': return 'text-orange-300';
    case 'common': return 'text-blue-300';
    default: return 'text-slate-300';
  }
};

function App() {
          const [gameState, setGameState] = useState('setup'); 
          const [themes, setThemes] = useState(INITIAL_THEMES);
          const [currentTheme, setCurrentTheme] = useState('clash');
          const [difficultyMode, setDifficultyMode] = useState('normal'); // normal, hard, custom
          const [players, setPlayers] = useState(['Speler 1', 'Speler 2', 'Speler 3']);
          const [newPlayerName, setNewPlayerName] = useState('');

          // --- Custom Theme State ---
          const [isCreatingTheme, setIsCreatingTheme] = useState(false);
          const [customThemeName, setCustomThemeName] = useState('');
          const [customThemeIcon, setCustomThemeIcon] = useState('🎨');
          const [customThemeCardsText, setCustomThemeCardsText] = useState('');
          
          const [gameData, setGameData] = useState({
            commonCard: null,
            imposterCard: null,
            imposterIndex: null,
            currentPlayerIndex: 0,
            isRevealing: false,
            resultRevealed: false,
          });

          const addPlayer = (e) => {
            e.preventDefault();
            if (newPlayerName.trim()) {
              setPlayers([...players, newPlayerName.trim()]);
              setNewPlayerName('');
            }
          };

          const removePlayer = (index) => {
            setPlayers(players.filter((_, i) => i !== index));
          };

          // --- CUSTOM THEME LOGIC ---
          const saveCustomTheme = (e) => {
            e.preventDefault();
            if(!customThemeName.trim() || !customThemeCardsText.trim()) return;

            // Parse text to cards
            // Format: "Naam, Emoji" of gewoon "Naam" (gebruikt thema icon)
            const lines = customThemeCardsText.split('\n').filter(line => line.trim().length > 0);
            
            if (lines.length < 2) {
                alert("Je hebt minimaal 2 kaarten nodig voor een thema!");
                return;
            }

            const newCards = lines.map(line => {
                const parts = line.split(',');
                const name = parts[0].trim();
                // Als er een komma is, pak het tweede deel als icoon, anders thema icoon
                const icon = parts.length > 1 ? parts[1].trim() : customThemeIcon;
                
                return {
                    name: name,
                    tier: 'common', // Custom cards zijn standaard common
                    icon: icon
                };
            });

            const themeId = `custom-${Date.now()}`;
            const newTheme = {
                label: customThemeName,
                icon: customThemeIcon,
                mode: 'custom',
                data: newCards
            };

            setThemes(prev => ({
                ...prev,
                [themeId]: newTheme
            }));
            
            setCurrentTheme(themeId);
            setIsCreatingTheme(false);
            setCustomThemeName('');
            setCustomThemeCardsText('');
            setCustomThemeIcon('🎨');
          };

          const startGame = () => {
            if (players.length < 3) return;

            const themeData = themes[currentTheme].data;
            
            // Selecteer twee VERSCHILLENDE kaarten uit het gekozen thema
            const randomCard1 = themeData[Math.floor(Math.random() * themeData.length)];
            let randomCard2;
            do {
              randomCard2 = themeData[Math.floor(Math.random() * themeData.length)];
            } while (randomCard1.name === randomCard2.name);

            const imposterIdx = Math.floor(Math.random() * players.length);

            setGameData({
              commonCard: randomCard1,
              imposterCard: randomCard2,
              imposterIndex: imposterIdx,
              currentPlayerIndex: 0,
              isRevealing: false,
              resultRevealed: false,
            });

            setGameState('turn');
          };

          const handleNext = () => {
            setGameData(prev => ({ ...prev, isRevealing: false }));
            if (gameData.currentPlayerIndex + 1 >= players.length) {
              setGameState('playing');
            } else {
              setGameData(prev => ({ ...prev, currentPlayerIndex: prev.currentPlayerIndex + 1 }));
            }
          };

          const resetGame = () => {
            setGameState('setup');
            setGameData({ 
                commonCard: null, 
                imposterCard: null, 
                imposterIndex: null, 
                currentPlayerIndex: 0, 
                isRevealing: false,
                resultRevealed: false 
            });
          };

          // Filter themes based on difficulty
          const availableThemes = useMemo(() => Object.entries(themes)
            .filter(([_key, theme]) => theme.mode === difficultyMode), [difficultyMode, themes]);

          // Zorg ervoor dat het huidige thema geldig is voor de modus, anders kies het eerste beschikbare
          useEffect(() => {
             // Als we net een nieuw custom thema hebben gemaakt (isCreatingTheme false), 
             // en we zitten in custom mode, willen we niet dat hij reset.
             if (isCreatingTheme) return;

             const currentThemeObj = themes[currentTheme];
             if (!currentThemeObj || currentThemeObj.mode !== difficultyMode) {
                if (availableThemes.length > 0) {
                    const firstKey = availableThemes[0][0];
                    setCurrentTheme(firstKey);
                } else if (difficultyMode === 'custom') {
                    // Geen custom themes beschikbaar? Zet modus niet terug, maar laat lege staat zien of open creator
                    setCurrentTheme(null);
                }
             }
          }, [difficultyMode, availableThemes, themes, isCreatingTheme]);


          // --- RENDERING ---

          if (gameState === 'setup') {
            return (
              <div className="min-h-screen bg-slate-900 text-white p-4 font-sans flex flex-col items-center">
                <header className="mb-6 text-center pt-6 animate-in">
                  <div className="flex justify-center mb-2">
                    <span className="text-4xl text-yellow-400">⚔️</span>
                  </div>
                  <h1 className="text-3xl font-black text-white drop-shadow-lg tracking-wider uppercase">
                    Undercover <span className="text-yellow-400">Royale</span>
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">Kies een thema & vind de bedrieger</p>
                </header>

                <div className="w-full max-w-md bg-slate-800 rounded-xl p-5 shadow-xl border border-slate-700 mb-20 animate-in" style={{animationDelay: '0.1s'}}>
                  
                  {/* GAMEMODE TOGGLE */}
                  <div className="flex bg-slate-900 p-1 rounded-lg mb-6 border border-slate-700">
                    <button
                      onClick={() => setDifficultyMode('normal')}
                      className={`flex-1 py-2 rounded-md font-bold text-sm transition ${difficultyMode === 'normal' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                      Normaal
                    </button>
                    <button
                      onClick={() => setDifficultyMode('hard')}
                      className={`flex-1 py-2 rounded-md font-bold text-sm transition flex items-center justify-center gap-2 ${difficultyMode === 'hard' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                      Hard
                    </button>
                    <button
                      onClick={() => setDifficultyMode('custom')}
                      className={`flex-1 py-2 rounded-md font-bold text-sm transition flex items-center justify-center gap-2 ${difficultyMode === 'custom' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                      Custom
                    </button>
                  </div>

                  {/* THEMA SELECTOR / CREATOR */}
                  <div className="mb-6">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-2">🔲 Kies Thema</span>
                        {difficultyMode === 'custom' && !isCreatingTheme && (
                            <button 
                                onClick={() => setIsCreatingTheme(true)}
                                className="text-purple-400 text-xs hover:text-purple-300 underline"
                            >
                                + Nieuw
                            </button>
                        )}
                    </h2>

                    {difficultyMode === 'custom' && isCreatingTheme ? (
                        <div className="bg-slate-900 border border-purple-500 rounded-lg p-4 mb-4 animate-in">
                            <h3 className="text-purple-300 font-bold mb-3 text-sm">Nieuw Thema Maken</h3>
                            <form onSubmit={saveCustomTheme} className="space-y-3">
                                <div className="flex gap-2">
                                    <input 
                                        className="w-12 bg-slate-800 border border-slate-600 rounded p-2 text-center" 
                                        placeholder="🎨"
                                        maxLength="2"
                                        value={customThemeIcon}
                                        onChange={(e) => setCustomThemeIcon(e.target.value)}
                                    />
                                    <input 
                                        className="flex-1 bg-slate-800 border border-slate-600 rounded p-2 text-white placeholder-slate-500" 
                                        placeholder="Thema naam (bv. Harry Potter)"
                                        required
                                        value={customThemeName}
                                        onChange={(e) => setCustomThemeName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <textarea 
                                        className="w-full h-32 bg-slate-800 border border-slate-600 rounded p-2 text-sm text-white placeholder-slate-500 font-mono"
                                        placeholder="Typ hier je kaarten. Eén per regel.&#10;Voorbeeld:&#10;Harry Potter&#10;Ron Wemel&#10;Hermelien, 📚"
                                        required
                                        value={customThemeCardsText}
                                        onChange={(e) => setCustomThemeCardsText(e.target.value)}
                                    ></textarea>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsCreatingTheme(false)}
                                        className="flex-1 bg-slate-700 text-slate-300 py-2 rounded text-sm hover:bg-slate-600"
                                    >
                                        Annuleren
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex-1 bg-purple-600 text-white py-2 rounded text-sm font-bold hover:bg-purple-500"
                                    >
                                        Opslaan
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                        {availableThemes.length > 0 ? availableThemes.map(([key, theme]) => (
                            <button
                            key={key}
                            onClick={() => setCurrentTheme(key)}
                            className={`p-3 rounded-lg flex items-center gap-3 transition border-2 ${
                                currentTheme === key 
                                ? (difficultyMode === 'hard' ? 'bg-red-900/30 border-red-500 text-white' : difficultyMode === 'custom' ? 'bg-purple-900/30 border-purple-500 text-white' : 'bg-blue-600/20 border-blue-500 text-white')
                                : 'bg-slate-700/50 border-transparent text-slate-400 hover:bg-slate-700'
                            }`}
                            >
                            <span className="text-2xl">{theme.icon}</span>
                            <div className="flex flex-col items-start text-left overflow-hidden">
                                <span className="font-bold text-sm truncate w-full">{theme.label}</span>
                                <span className="text-xs text-slate-500">{theme.data.length} kaarten</span>
                            </div>
                            </button>
                        )) : (
                            <div className="col-span-2 text-center py-8 text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
                                <p className="mb-2">Nog geen custom thema's.</p>
                                <button onClick={() => setIsCreatingTheme(true)} className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-bold">Maak er een!</button>
                            </div>
                        )}
                        </div>
                    )}
                  </div>

                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    👤 Spelers ({players.length})
                  </h2>
                  
                  <ul className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                    {players.map((player, index) => (
                      <li key={index} className="flex justify-between items-center bg-slate-700 p-2 px-3 rounded-lg border border-slate-600 animate-in">
                        <span className="font-medium">{player}</span>
                        <button onClick={() => removePlayer(index)} className="text-red-400 hover:text-red-300 p-1">🗑️</button>
                      </li>
                    ))}
                  </ul>

                  <form onSubmit={addPlayer} className="flex gap-2 mb-6">
                    <input
                      type="text"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      placeholder="Naam..."
                      className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-400 transition"
                    />
                    <button type="submit" disabled={!newPlayerName.trim()} className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg font-bold">➕</button>
                  </form>

                  <button
                    onClick={startGame}
                    disabled={players.length < 3 || (difficultyMode === 'custom' && availableThemes.length === 0) || isCreatingTheme}
                    className={`w-full text-black font-black text-lg py-4 rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.3)] active:translate-y-1 transition uppercase tracking-wide ${
                      players.length < 3 || (difficultyMode === 'custom' && availableThemes.length === 0) || isCreatingTheme ? 'opacity-50 cursor-not-allowed bg-slate-600' : (difficultyMode === 'hard' ? 'bg-red-500 hover:bg-red-400 shadow-red-900' : difficultyMode === 'custom' ? 'bg-purple-500 hover:bg-purple-400 shadow-purple-900' : 'bg-yellow-500 hover:bg-yellow-400 shadow-yellow-800')
                    }`}
                  >
                    Start Spel
                  </button>
                </div>
              </div>
            );
          }

          if (gameState === 'turn') {
            const currentPlayerName = players[gameData.currentPlayerIndex];
            const isImposter = gameData.imposterIndex !== null && gameData.currentPlayerIndex === gameData.imposterIndex;
            const currentCard = isImposter ? gameData.imposterCard : gameData.commonCard;
            const isHardmode = difficultyMode === 'hard';
            const theme = themes[currentTheme];

            // Safety check for deleted themes
            if (!theme) return <div className="text-white p-10 text-center">Fout: Thema niet gevonden. <button onClick={resetGame} className="underline">Terug</button></div>;

            return (
              <div className={`min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center ${isHardmode ? 'selection:bg-red-500' : ''}`}>
                <div className="w-full max-w-md text-center">
                  <div className="mb-6 animate-in">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 border ${isHardmode ? 'bg-red-900/20 border-red-800' : 'bg-slate-800 border-slate-700'}`}>
                       <span>{theme.icon}</span>
                       <span className="text-sm font-bold text-slate-300">{theme.label}</span>
                       {isHardmode && <span className="text-xs bg-red-600 text-white px-1 rounded ml-1 font-bold">HARD</span>}
                    </div>
                    <h3 className="text-slate-400 uppercase tracking-widest text-sm font-bold mb-1">Beurt van</h3>
                    <h1 className="text-4xl font-black text-white">{currentPlayerName}</h1>
                  </div>

                  <div className="relative min-h-[360px] mb-8 perspective-1000">
                    {!gameData.isRevealing ? (
                      <button 
                        onClick={() => setGameData(prev => ({ ...prev, isRevealing: true }))}
                        className={`w-full h-80 bg-gradient-to-br rounded-2xl border-4 shadow-2xl flex flex-col items-center justify-center cursor-pointer hover:scale-[1.02] transition-transform active:scale-95 group animate-zoom ${isHardmode ? 'from-red-900 to-slate-900 border-red-700' : difficultyMode === 'custom' ? 'from-purple-900 to-slate-900 border-purple-700' : 'from-slate-700 to-slate-800 border-slate-500'}`}
                      >
                        <div className={`p-6 rounded-full mb-4 border ${isHardmode ? 'bg-red-900/50 border-red-600' : difficultyMode === 'custom' ? 'bg-purple-900/50 border-purple-600' : 'bg-slate-900/50 border-slate-600'}`}>
                          <span className={`text-5xl ${isHardmode ? 'text-red-300' : 'text-slate-300'}`}>👁️</span>
                        </div>
                        <span className="text-2xl font-bold text-white uppercase tracking-wider">Bekijk Kaart</span>
                        <p className={`${isHardmode ? 'text-red-300' : 'text-slate-400'} text-sm mt-2 px-8`}>Houd je scherm verborgen!</p>
                      </button>
                    ) : (
                      <div className={`w-full h-80 bg-gradient-to-br ${getTierColor(currentCard.tier)} rounded-2xl border-4 shadow-[0_0_50px_rgba(0,0,0,0.6)] flex flex-col items-center justify-between p-6 animate-zoom duration-300`}>
                        <div className="w-full flex justify-between items-start">
                           <span className={`text-xs font-bold uppercase tracking-wider bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm ${getTierText(currentCard.tier)}`}>
                             {currentCard.tier}
                           </span>
                           <span className="text-white/20">❓</span>
                        </div>

                        <div className="text-center transform translate-y-2">
                          <div className="text-7xl mb-6 drop-shadow-2xl filter hover:scale-110 transition cursor-default">
                            {currentCard.icon}
                          </div>
                          <h2 className="text-3xl font-black text-white drop-shadow-md leading-tight mb-2 tracking-wide text-shadow-lg">
                            {currentCard.name}
                          </h2>
                        </div>

                        <button 
                          onClick={handleNext}
                          className="w-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white py-3 rounded-xl font-bold border border-white/10 flex items-center justify-center gap-2 transition"
                        >
                          <span className="mr-2">🙈</span>
                          Verberg & Volgende
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {!gameData.isRevealing && (
                     <p className="text-slate-500 text-sm animate-pulse">Geef de telefoon aan {currentPlayerName}</p>
                  )}
                </div>
              </div>
            );
          }

          if (gameState === 'playing') {
            const theme = themes[currentTheme];
            const commonCard = gameData.commonCard;
            const imposterCard = gameData.imposterCard;
            const imposterName = gameData.imposterIndex !== null ? players[gameData.imposterIndex] : 'Onbekend';

            return (
              <div className="min-h-screen bg-slate-900 text-white p-4 flex flex-col items-center justify-center text-center">
                <span className="text-6xl text-yellow-400 mb-6 animate-bounce">👑</span>
                <h1 className="text-4xl font-black text-white mb-2 animate-in">Discussie Tijd!</h1>
                <p className="text-slate-400 text-lg mb-8 max-w-xs mx-auto animate-in" style={{animationDelay: '0.1s'}}>
                  Wie praat er onzin over zijn kaart?
                </p>

                <div className="w-full max-w-md bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 relative overflow-hidden transition-all duration-500 animate-in" style={{animationDelay: '0.2s'}}>
                  {!gameData.resultRevealed ? (
                    <div className="py-2 flex flex-col items-center">
                       <span className="text-6xl text-slate-600 mb-4">🔒</span>
                       <p className="text-slate-300 mb-8 font-medium">Stem eerst op de bedrieger!</p>
                       <button 
                          onClick={() => setGameData(prev => ({...prev, resultRevealed: true}))}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-900/50 hover:shadow-blue-900/80 hover:-translate-y-1 transition-all active:translate-y-0 text-lg flex items-center gap-2"
                       >
                          <span>👁️</span>
                          Onthul de Waarheid
                       </button>
                    </div>
                  ) : (
                    <div className="animate-in">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-6xl">
                            {theme.icon}
                        </div>
                        
                        <h3 className="text-slate-500 text-xs font-bold uppercase mb-4 tracking-widest">De Ontknoping</h3>
                        
                        {commonCard && imposterCard ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 flex flex-col items-center">
                                <span className="text-xs text-slate-400 uppercase block mb-2">Groep</span>
                                <span className="text-4xl mb-2">{commonCard.icon}</span>
                                <span className={`font-bold text-md leading-tight ${getTierText(commonCard.tier)}`}>{commonCard.name}</span>
                                </div>
                                
                                <div className="bg-slate-700/50 p-4 rounded-lg border border-red-900/50 bg-red-900/10 flex flex-col items-center">
                                <span className="text-xs text-red-400 uppercase block mb-2">Imposter</span>
                                <span className="text-4xl mb-2">{imposterCard.icon}</span>
                                <span className="font-bold text-md text-white leading-tight">{imposterCard.name}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-red-500">Fout: Kaartgegevens ontbreken.</p>
                        )}


                        <div className="mt-6 pt-6 border-t border-slate-700">
                            <p className="text-sm text-slate-400 mb-2">De Imposter was:</p>
                            <p className="text-2xl font-bold text-red-400">{imposterName}</p>
                        </div>
                    </div>
                  )}
                </div>

                {/* Hide action buttons until reveal to prevent accidental clicks */}
                {gameData.resultRevealed && (
                    <div className="flex flex-col w-full max-w-md gap-3 animate-in" style={{animationDelay: '0.1s'}}>
                    <button 
                        onClick={startGame}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-[0_4px_0_rgb(21,128,61)] active:translate-y-1 transition flex items-center justify-center gap-2"
                    >
                        <span>🔄</span>
                        Nog een keer ({theme.label})
                    </button>
                    
                    <button 
                        onClick={resetGame}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-4 rounded-xl transition"
                    >
                        Ander Thema / Spelers
                    </button>
                    </div>
                )}
              </div>
            );
          }

          return null;
        }

        // Render de applicatie
        const container = document.getElementById('root');
        const root = ReactDOM.createRoot(container);
        root.render(<App />);
    

// Mount your React app
ReactDOM.render(<App />, document.getElementById('root'));
