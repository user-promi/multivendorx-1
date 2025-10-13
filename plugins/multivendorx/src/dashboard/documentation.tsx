import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell, CalendarInput } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';

type StoreRow = {
    id?: number;
    store_name?: string;
    store_slug?: string;
    status?: string;
};

const Documentation: React.FC = () => {
    return (
        <>
            <div className="page-title-wrapper">
                <div className="page-title">
                    <div className="title">Documentation</div>
                    <div className="des">Everything you need to know about store operations</div>
                </div>
                <div className="buttons-wrapper">

                </div>
            </div>

            <div className="row">
                <div className="column">
                    <div className="documentation-wrapper">
                        <div className="document">
                            <div className="title">
                                Safety and Emergency Protocols
                                <i className="adminlib-arrow"></i>
                            </div>
                            <div className="description">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus doloremque excepturi sint, voluptate illum animi!
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores ex quam quis quos nostrum eos in, vitae culpa reiciendis consequuntur earum ullam officia eligendi hic a corporis aliquam ab ad nobis blanditiis quod provident non eveniet excepturi. Illum dolorum quisquam eos ipsam qui sit cupiditate non alias, incidunt accusantium esse totam, asperiores voluptatibus placeat ex facilis sequi. Ea odio neque dignissimos ab, temporibus, labore architecto ipsa, sapiente nostrum aspernatur dolores mollitia corporis distinctio tempora impedit dolor consectetur exercitationem eum commodi? Amet, enim laboriosam atque accusantium facere autem. Reprehenderit soluta, obcaecati natus corrupti nisi omnis, aspernatur a vel ratione earum esse minima asperiores harum atque ut numquam adipisci dolor cumque minus rerum mollitia nesciunt? Tenetur suscipit harum tempora sunt aperiam hic cupiditate vel error nobis voluptatum dolorem nihil soluta laboriosam, labore ab eveniet. Nam iste dicta quod quae voluptas temporibus tenetur nihil dolore reprehenderit unde accusantium expedita itaque, obcaecati eveniet nobis.
                            </div>
                        </div>

                        <div className="document">
                            <div className="title">
                                Safety and Emergency Protocols
                                <i className="adminlib-arrow"></i>
                            </div>
                            <div className="description">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus doloremque excepturi sint, voluptate illum animi! Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quis impedit, accusantium animi suscipit excepturi minima sapiente distinctio non quidem nostrum voluptatem iste earum voluptate quasi? Tempore aliquid nihil officiis recusandae facilis, consequuntur officia maiores repellat provident ad et distinctio earum eius repellendus doloribus porro aspernatur vitae. Provident quia eius cupiditate iusto deleniti tempora ut delectus expedita voluptatum in rerum, facilis dignissimos quas nam explicabo laboriosam. Magni vero natus ex est, deserunt, maiores ipsam autem quasi facilis impedit nemo minus laboriosam maxime. Quas quae perferendis sed maxime iusto beatae soluta similique? Vitae dolore sequi quo, voluptates voluptate quia repellat aliquid unde ipsam nemo corporis distinctio ipsa beatae rerum dolorem! Deserunt maiores placeat omnis molestiae eum rerum aperiam debitis reprehenderit quasi eligendi quam ullam delectus adipisci totam, odit veniam, recusandae animi, deleniti enim dolorem nesciunt. Facere placeat ad fugit eveniet eligendi? Reprehenderit unde enim veritatis iusto illo, doloremque fugiat quisquam nesciunt eius inventore a ullam possimus rem fugit odio magni saepe in eveniet consectetur perferendis, totam provident est. Veritatis dignissimos numquam iusto explicabo deserunt officia ullam fuga aspernatur, possimus in doloremque facere sequi nemo distinctio non cumque harum veniam laboriosam! Adipisci, quae eaque atque qui deleniti in nostrum ea? Cum minima fuga alias sit enim dolore, saepe ipsa pariatur veritatis, eum architecto aperiam laboriosam. Laborum iusto, ullam laudantium vitae reprehenderit, perspiciatis dolore eos temporibus soluta cumque omnis aut voluptatem odio officiis cum accusamus porro, similique non maxime consectetur atque. Ratione corporis quae illo. Unde doloremque molestias at eaque quis excepturi labore neque laborum quo eum. Illo magni eum deserunt nihil, error ad facilis, voluptatem ullam cum recusandae minima dignissimos! Voluptatum corporis, vero quibusdam quod adipisci sunt provident doloremque animi incidunt numquam sequi velit laboriosam explicabo nihil. Consequatur quae nobis quod voluptatum consequuntur repellat ipsa itaque, quisquam fugiat perspiciatis, similique cupiditate doloribus voluptatem.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Documentation;