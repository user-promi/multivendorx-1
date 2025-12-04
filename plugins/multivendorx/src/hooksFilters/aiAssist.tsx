import { addFilter } from "@wordpress/hooks";

const toggleCard = (cardId) => {
        const body = document.querySelector(`#${cardId} .card-body`);
        const arrow = document.querySelector(`#${cardId} .arrow-icon`);

        if (!body || !arrow) return;

        body.classList.toggle('hide-body');
        arrow.classList.toggle('rotate');
    };
    
addFilter(
    "product_ai_assist",
    "my-plugin/ai-assist-card",
    (content, product) => {

        return (
            <>
                {content}

                <div className="card" id="card-ai-assist">
                    <div className="card-header">
                        <div className="left">
                            <div className="title">AI assist</div>
                        </div>
                        <div className="right">
                            <i
                                className="adminlib-pagination-right-arrow arrow-icon"
                                onClick={() => toggleCard('card-ai-assist')}
                            ></i>
                        </div>
                    </div>

                    <div className="card-body">
                        <div className="ai-assist-wrapper">

                            <div className="suggestions-wrapper">
                                <div className="suggestions-title">
                                    Suggestions
                                </div>

                                <div className="box">
                                    <span>
                                        Lorem ipsum dolor sit amet,
                                        consectetur adipisicing elit. Nisi
                                        veniam doloremque omnis aspernatur
                                        similique alias vel illo ut, corrupti
                                        recusandae quo nulla, reprehenderit
                                        harum vitae!
                                    </span>
                                </div>

                                <div className="box">
                                    <span>
                                        Lorem ipsum dolor sit amet,
                                        consectetur adipisicing elit. Nisi
                                        veniam doloremque omnis aspernatur
                                        similique alias vel illo ut, corrupti
                                        recusandae quo nulla, reprehenderit
                                        harum vitae!
                                    </span>
                                </div>
                            </div>

                            <div className="sender-wrapper">
                                <input
                                    type="text"
                                    placeholder="Write the prompt or select an example"
                                />
                                <div className="icon-wrapper">
                                    <i className="adminlib-mail"></i>
                                    <i className="adminlib-send"></i>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </>
        );
    }, 10
);

