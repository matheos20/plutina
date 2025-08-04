import React from 'react';
import './home.css';
function Home() {
    return (
        <main>
            <div className="container vh-3000" style={{backgroundColor: "#fff"}}>
                        <section className="hero-section mt-4">
                            <div className="hero-content">
                                <h1>Votre partenaire pour vos événements réussis</h1>
                                <p>Organisation, décoration, sonorisation, tout en un.</p>
                                <button>Nous contacter</button>
                            </div>
                        </section>

                <section className="section_all  mt-4" id="about">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="section_title_all text-center">
                                    <h3 className="font-weight-bold">Welcome To <span className="text-custom">Plutina</span>
                                    </h3>
                                    <p className="section_subtitle mx-auto text-muted">Lorem Ipsum is simply dummy text
                                        of the printing and typesetting industry. <br/>Lorem Ipsum has been the
                                        industry's standard dummy text.</p>
                                    <div className="">
                                        <i className=""></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row vertical_content_manage mt-5">
                            <div className="col-lg-6">
                                <div className="about_header_main mt-3">
                                    <div className="about_icon_box">
                                        <p className="text_custom font-weight-bold">Lorem Ipsum is simply dummy text</p>
                                    </div>
                                    <h4 className="about_heading text-capitalize font-weight-bold mt-4">Lorem Ipsum is
                                        simply dummy text of the printing industry.</h4>
                                    <p className="text-muted mt-3">Contrary to popular belief, Lorem Ipsum is not simply
                                        random text. It has roots in a piece of classical Latin literature from 45 BC,
                                        making it over 2000 years old.</p>

                                    <p className="text-muted mt-3"> Richard McClintock, a Latin professor at
                                        Hampden-Sydney College in Virginia, looked up one of the more obscure Latin
                                        words, consectetur, from a Lorem Ipsum passage.</p>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="img_about mt-3">
                                    <img src="/images/plut12.png" alt=""
                                         className="img-fluid mx-auto d-block" style={{borderRadius: "20px"}}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                    <section className="evenements-section">
                        <h2>Nos événements récents</h2>
                            <div className="evenements-grid">
                                <div className="event-card">
                                    <img src="/images/v1.jpg" alt="Mariage élégant" />
                                    <h3>Mariage Élégant</h3>
                                    <p>Une ambiance féérique pour un jour inoubliable.</p>
                                </div>
                                <div className="event-card">
                                    <img src="/images/v2.jpg" alt="Soirée entreprise" />
                                    <h3>Soirée Entreprise</h3>
                                    <p>Un cadre professionnel avec une touche festive.</p>
                                </div>
                                <div className="event-card">
                                    <img src="/images/v3.jpg" alt="Anniversaire surprise" />
                                    <h3>Anniversaire Surprise</h3>
                                    <p>Des souvenirs inoubliables pour petits et grands.</p>
                                </div>
                            </div>
                    </section>
            </div>

        </main>
    );
}

export default Home;
