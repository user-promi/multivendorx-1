import React, { useState, useEffect } from 'react';
import { addFilter } from '@wordpress/hooks';
import { getApiLink } from 'zyra';
import axios from 'axios';

// Global variable to store suggestions (if needed globally)
let globalAiSuggestions = {
    productName: ["Enter a prompt and click send to generate names.", ""],
    shortDescription: ["Enter a prompt and click send to generate descriptions.", ""],
    productDescription: ["Enter a prompt and click send to generate full descriptions.", ""]
};

const AICard = () => {
    // State for the suggestions
    const [aiSuggestions, setAiSuggestions] = useState(globalAiSuggestions);
    const [userPrompt, setUserPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCardOpen, setIsCardOpen] = useState(true);

    // Fetch suggestions from the API
    const fetchSuggestions = (promptText) => {
        if (!promptText || promptText.trim() === '') {
            setError('Please enter a prompt!');
            return;
        }

        setIsLoading(true);
        setError('');
        
        // Set loading state
        setAiSuggestions({
            productName: ["Generating...", ""],
            shortDescription: ["Generating...", ""],
            productDescription: ["Generating...", ""]
        });

        axios({
            method: 'POST',
            url: getApiLink(appLocalizer, 'ai-assistant/suggestions'),
            headers: { 
                'X-WP-Nonce': appLocalizer.nonce,
                'Content-Type': 'application/json'
            },
            data: {
                user_prompt: promptText
            }
        }).then((response) => {
            if (response.data && response.data.productName) {
                // Update both local state and global variable
                const newSuggestions = {
                    productName: response.data.productName,
                    shortDescription: response.data.shortDescription,
                    productDescription: response.data.productDescription
                };
                
                setAiSuggestions(newSuggestions);
                globalAiSuggestions = newSuggestions;
            } else {
                const errorMsg = response.data?.message || "Failed to fetch suggestions. Check API keys.";
                setError(errorMsg);
                setAiSuggestions({
                    productName: [`Error: ${errorMsg}`, ""],
                    shortDescription: [`Error: ${errorMsg}`, ""],
                    productDescription: [`Error: ${errorMsg}`, ""]
                });
            }
            setIsLoading(false);
        }).catch((error) => {
            const errorMsg = error.response?.data?.message || "Network error or server failed.";
            setError(errorMsg);
            setAiSuggestions({
                productName: [`Error: ${errorMsg}`, ""],
                shortDescription: [`Error: ${errorMsg}`, ""],
                productDescription: [`Error: ${errorMsg}`, ""]
            });
            setIsLoading(false);
        });
    };

    const handleSendPrompt = () => {
        fetchSuggestions(userPrompt);
    };

    const toggleCard = () => {
        setIsCardOpen(!isCardOpen);
    };

    return (
        <div className="card" id="card-ai-assist">
            <div className="card-header">
                <div className="left">
                    <div className="title">AI assist</div>
                </div>
                <div className="right">
                    <i
                        className={`adminlib-pagination-right-arrow arrow-icon ${isCardOpen ? 'rotate' : ''}`}
                        onClick={toggleCard}
                    ></i>
                </div>
            </div>

            {isCardOpen && (
                <div className="card-body">
                    <div className="ai-assist-wrapper">
                        {error && (
                            <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>
                                {error}
                            </div>
                        )}

                        <div className="suggestions-wrapper">
                            <div className="suggestions-title">
                                Suggestions
                            </div>
                            
                            {/* Product Name Suggestions */}
                            <div className="suggestion-category">
                                <h4>🏷️ Product Name Suggestions</h4>
                                {aiSuggestions.productName.map((suggestion, index) => (
                                    suggestion && (
                                        <div className="box" key={`name-sugg-${index}`}>
                                            <span>{suggestion}</span>
                                        </div>
                                    )
                                ))}
                            </div>

                            {/* Product Short Description Suggestions */}
                            <div className="suggestion-category">
                                <h4>📝 Product Short Description Suggestions</h4>
                                {aiSuggestions.shortDescription.map((suggestion, index) => (
                                    suggestion && (
                                        <div className="box" key={`short-desc-sugg-${index}`}>
                                            <span>{suggestion}</span>
                                        </div>
                                    )
                                ))}
                            </div>

                            {/* Product Description Suggestions */}
                            <div className="suggestion-category">
                                <h4>📖 Product Description Suggestions</h4>
                                {aiSuggestions.productDescription.map((suggestion, index) => (
                                    suggestion && (
                                        <div className="box" key={`desc-sugg-${index}`}>
                                            <span>{suggestion}</span>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                        
                        {/* Prompt Input Section */}
                        <div className="sender-wrapper">
                            <input
                                type="text"
                                placeholder="Write the prompt, e.g., 'A durable leather hiking boot for all weather.'"
                                value={userPrompt}
                                onChange={(e) => setUserPrompt(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !isLoading) {
                                        handleSendPrompt();
                                    }
                                }}
                                disabled={isLoading}
                            />
                            <div className="icon-wrapper">
                                <i className="adminlib-mail"></i>
                                <i 
                                    className={`adminlib-send ${isLoading ? 'loading' : ''}`}
                                    onClick={!isLoading ? handleSendPrompt : undefined}
                                    style={{cursor: isLoading ? 'not-allowed' : 'pointer'}}
                                ></i>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Modified filter to use React component
addFilter(
    "product_ai_assist",
    "my-plugin/ai-assist-card",
    (content, product) => {
        return (
            <>
                {content}
                <AICard />
            </>
        );
    },
    10
);