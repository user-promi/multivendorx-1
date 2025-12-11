import React, { useState, useEffect } from 'react';
import { addFilter } from '@wordpress/hooks';
import { getApiLink } from 'zyra';
import axios from 'axios';

const AICard = () => {
	const [aiSuggestions, setAiSuggestions] = useState({
		productName: [],
		shortDescription: [],
		productDescription: [],
	});
	const [userPrompt, setUserPrompt] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [isCardOpen, setIsCardOpen] = useState(true);
	const [hasSuggestions, setHasSuggestions] = useState(false);

	// Function to update product fields (will be passed from parent)
	const updateProductField = (field, value) => {
		// Map the field names to match what AddProduct expects
		let fieldName = field;
		if (field === 'productName') fieldName = 'name';
		if (field === 'shortDescription') fieldName = 'short_description';
		if (field === 'productDescription') fieldName = 'description';

		const event = new CustomEvent('ai-suggestion-selected', {
			detail: { field: fieldName, value },
		});
		window.dispatchEvent(event);
	};

	// Fetch suggestions from the API
	const fetchSuggestions = (promptText) => {
		if (!promptText || promptText.trim() === '') {
			setError('Please enter a prompt!');
			return;
		}

		setIsLoading(true);
		setError('');
		setHasSuggestions(false);

		// Clear suggestions while loading
		setAiSuggestions({
			productName: [],
			shortDescription: [],
			productDescription: [],
		});

		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, 'ai-assistant'),
			headers: {
				'X-WP-Nonce': appLocalizer.nonce,
				'Content-Type': 'application/json',
			},
			params: {
				endpoint: 'suggestions',
				user_prompt: promptText,
			},
		})
			.then((response) => {
				if (response.data && response.data.productName) {
					// Filter out empty suggestions
					const newSuggestions = {
						productName: response.data.productName.filter(
							(s) => s && s.trim()
						),
						shortDescription: response.data.shortDescription.filter(
							(s) => s && s.trim()
						),
						productDescription:
							response.data.productDescription.filter(
								(s) => s && s.trim()
							),
					};

					setAiSuggestions(newSuggestions);

					// Check if we have any actual suggestions
					const hasAnySuggestions =
						newSuggestions.productName.length > 0 ||
						newSuggestions.shortDescription.length > 0 ||
						newSuggestions.productDescription.length > 0;

					setHasSuggestions(hasAnySuggestions);
				} else {
					const errorMsg =
						response.data?.message ||
						'Failed to fetch suggestions. Check API keys.';
					setError(errorMsg);
					setHasSuggestions(false);
				}
				setIsLoading(false);
			})
			.catch((error) => {
				const errorMsg =
					error.response?.data?.message ||
					'Network error or server failed.';
				setError(errorMsg);
				setHasSuggestions(false);
				setIsLoading(false);
			});
	};

	const handleSendPrompt = () => {
		fetchSuggestions(userPrompt);
	};

	const handleSuggestionClick = (field, suggestion) => {
		updateProductField(field, suggestion);

		// Remove the clicked suggestion from the list
		setAiSuggestions((prev) => {
			// Ensure the field exists and is an array
			if (!prev[field] || !Array.isArray(prev[field])) {
				return prev;
			}
			return {
				...prev,
				[field]: prev[field].filter((s) => s !== suggestion),
			};
		});

		// Check if all suggestions are now empty
		const remainingSuggestions =
			aiSuggestions.productName.filter((s) => s !== suggestion).length +
			aiSuggestions.shortDescription.filter((s) => s !== suggestion)
				.length +
			aiSuggestions.productDescription.filter((s) => s !== suggestion)
				.length;

		if (remainingSuggestions === 0) {
			setHasSuggestions(false);
		}
	};

	const toggleCard = () => {
		setIsCardOpen(!isCardOpen);
	};

	// Reset suggestions when prompt is cleared
	useEffect(() => {
		if (!userPrompt.trim()) {
			setAiSuggestions({
				productName: [],
				shortDescription: [],
				productDescription: [],
			});
			setHasSuggestions(false);
			setError('');
		}
	}, [userPrompt]);

	return (
		<div className="card-content" id="card-ai-assist">
			<div className="card-header">
				<div className="left">
					<div className="title">AI assist</div>
				</div>
				<div className="right">
					<i
						className={`adminlib-pagination-right-arrow arrow-icon ${
							isCardOpen ? 'rotate' : ''
						}`}
						onClick={toggleCard}
					></i>
				</div>
			</div>

			{isCardOpen && (
				<div className="card-body">
					<div className="ai-assist-wrapper">
						{error && (
							<div
								className="error-message"
								style={{ color: 'red', marginBottom: '10px' }}
							>
								{error}
							</div>
						)}

						{/* Only show suggestions section if we have actual suggestions */}
						{hasSuggestions && (
							<div className="suggestions-wrapper">
								<div className="suggestions-title">
									Suggestions
									<small className="click-hint">
										(Click any suggestion to apply it)
									</small>
								</div>

								{/* Product Name Suggestions */}
								{aiSuggestions.productName.length > 0 && (
									<div className="suggestion-category">
										<h4>Product Name Suggestions</h4>
										{aiSuggestions.productName.map(
											(suggestion, index) => (
												<div
													className="box clickable-suggestion"
													key={`name-sugg-${index}`}
													onClick={() =>
														handleSuggestionClick(
															'productName',
															suggestion
														)
													}
												>
													<span>{suggestion}</span>
													<i
														className="adminlib-arrow-right"
														style={{
															marginLeft: '8px',
															fontSize: '12px',
														}}
													></i>
												</div>
											)
										)}
									</div>
								)}

								{/* Product Short Description Suggestions */}
								{aiSuggestions.shortDescription.length > 0 && (
									<div className="suggestion-category">
										<h4>
											Product Short Description
											Suggestions
										</h4>
										{aiSuggestions.shortDescription.map(
											(suggestion, index) => (
												<div
													className="box clickable-suggestion"
													key={`short-desc-sugg-${index}`}
													onClick={() =>
														handleSuggestionClick(
															'shortDescription',
															suggestion
														)
													}
												>
													<span>{suggestion}</span>
													<i
														className="adminlib-arrow-right"
														style={{
															marginLeft: '8px',
															fontSize: '12px',
														}}
													></i>
												</div>
											)
										)}
									</div>
								)}

								{/* Product Description Suggestions */}
								{aiSuggestions.productDescription.length >
									0 && (
									<div className="suggestion-category">
										<h4>Product Description Suggestions</h4>
										{aiSuggestions.productDescription.map(
											(suggestion, index) => (
												<div
													className="box clickable-suggestion"
													key={`desc-sugg-${index}`}
													onClick={() =>
														handleSuggestionClick(
															'productDescription',
															suggestion
														)
													}
												>
													<span>{suggestion}</span>
													<i
														className="adminlib-arrow-right"
														style={{
															marginLeft: '8px',
															fontSize: '12px',
														}}
													></i>
												</div>
											)
										)}
									</div>
								)}
							</div>
						)}

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
									className={`adminlib-send ${
										isLoading ? 'loading' : ''
									}`}
									onClick={
										!isLoading
											? handleSendPrompt
											: undefined
									}
									style={{
										cursor: isLoading
											? 'not-allowed'
											: 'pointer',
									}}
								></i>
							</div>
						</div>

						{/* Show message when waiting for input */}
						{!hasSuggestions &&
							!isLoading &&
							!error &&
							userPrompt.trim() === '' && (
								<div className="empty-state">
									<div className="empty-icon">
										<i className="adminlib-lightbulb"></i>
									</div>
									<p>
										Enter a prompt above to generate AI
										suggestions for your product.
									</p>
								</div>
							)}

						{/* Show loading state */}
						{isLoading && (
							<div className="loading-state">
								<div className="loading-spinner"></div>
								<p>Generating suggestions...</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

// Modified filter to use React component
addFilter(
	'product_ai_assist',
	'my-plugin/ai-assist-card',
	(content, product) => {
		return (
			<>
				{content}
				<AICard product={product} />
			</>
		);
	},
	10
);
