import { promises as fs } from 'fs'

export class ProductManager {
    constructor ( path ) {
        this.products = []
        this.path = path
    }
    static autoId ( maxId ) {
        this.unicId ? this.unicId ++ : this.unicId = maxId + 1;
        return this.unicId;
    }
    async getProducts () {
            const productsJson = JSON.parse ( await fs.readFile ( this.path, 'utf-8' ));
            return productsJson;
    }
    async writeDataBase ( prods ) {
            const productsJson = await fs.writeFile ( this.path, JSON.stringify ( prods ) );
            return productsJson
    }
    async addProduct ( itemDetail ) {
        const productsJson = await this.getProducts ();
        const prodsIds = productsJson.map ( ids => parseInt ( ids.id ));
        const maxId = Math.max ( ...prodsIds );
        let compareCod = productsJson.find ( cod => cod.code == itemDetail.code );
        if ( compareCod ) {
            return false;
        } else {
            const newItemId = ProductManager.autoId ( maxId );
            itemDetail = { id:newItemId, ...itemDetail };
            productsJson.push ( itemDetail );
            this.writeDataBase ( productsJson );
            return true;
        }
    }
    async getProductById ( id ) {
        const products = await this.getProducts ();
        const search = products.find ( object => object.id === id );
        return search ? search : false;
    }
    async updateProduct ( id, modifyProduct ) {
        const productsJson = await this.getProducts ();
        const productIndex = productsJson.findIndex ( object => object.id === id );
        if ( productIndex != -1 ) {
            productsJson [ productIndex ].title = modifyProduct.title ? modifyProduct.title : productsJson [ productIndex ].title;
            productsJson [ productIndex ].description = modifyProduct.description ? modifyProduct.description : productsJson [ productIndex ].description;
            productsJson [ productIndex ].code = modifyProduct.code ? modifyProduct.code : productsJson [ productIndex ].code;
            productsJson [ productIndex ].price = modifyProduct.price ? modifyProduct.price : productsJson [ productIndex ].price;
            productsJson [ productIndex ].status = modifyProduct.status ? modifyProduct.status : productsJson [ productIndex ].status;
            productsJson [ productIndex ].stock = modifyProduct.stock ? modifyProduct.stock : productsJson [ productIndex ].stock;
            productsJson [ productIndex ].category = modifyProduct.category ? modifyProduct.category : productsJson [ productIndex ].category;
            productsJson [ productIndex ].thumbnails = modifyProduct.thumbnails ? modifyProduct.thumbnails : productsJson [ productIndex ].thumbnails;
            this.writeDataBase ( productsJson );
            return true;
        } else {
            return false;
        }
    }
    async deleteProduct ( id ) {
        const productsJson = await this.getProducts ();
        const productsToSave = productsJson.filter ( object => object.id != id );
        if ( productsToSave ) {
            this.writeDataBase ( productsToSave );
            return true;
        } else {
            return false;
        }
    }
}

