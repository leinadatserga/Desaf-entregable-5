import { promises as fs } from 'fs'

export class CartsManager {
    constructor ( path ) {
        this.carts = []
        this.path = path
    }
    static autoId ( id ) {
        this.unicId ? this.unicId ++ : this.unicId = 1 + id;
        return this.unicId;
    }
    async getCarts () {
            const cartJson = JSON.parse ( await fs.readFile ( this.path, 'utf-8' ));
            return cartJson;
    }
    async writeDataBase ( cart ) {
            const cartJson = await fs.writeFile ( this.path, JSON.stringify ( cart ) );
            return cartJson
    }
    async addCart ( cartDetail ) {
        let maxId;
        const cartJson = await this.getCarts ();
        const cartsIds = cartJson.map ( ids => parseInt ( ids.id ));
        cartsIds == "" ? maxId = 0 : maxId = Math.max ( ...cartsIds );
        if ( cartsIds.length > 9 ) {
            return false;
        } else {
            cartDetail.id = CartsManager.autoId ( maxId );
            cartJson.push ( cartDetail )
            this.writeDataBase ( cartJson );
            return true;
        }
    }
    async findProd ( arrayProds, prod, pid ) {
        const compareId = arrayProds.find ( prodId => prodId.product === parseInt ( pid ));
        if ( compareId ) {
            compareId.quantity = compareId.quantity+1
            return arrayProds;
        } else {
            arrayProds.push ( prod );
            return arrayProds;
        }
    }
    async addProd ( cid, pid) {
        const cartJson = await this.getCarts ();
        const prod = { product: parseInt ( pid ), quantity: 1 };
        const findCartId = cartJson.findIndex ( object => object.id === parseInt ( cid ));
        if ( findCartId != -1 ) {
            const arrayProds = cartJson [ findCartId ].products;
            const newProds = await this.findProd ( arrayProds, prod, pid );
            cartJson [ findCartId ].products = newProds;
            this.writeDataBase ( cartJson );
            return true;
        }
        else {
            return false;
        }
    }
    async getCartById ( id ) {
        const carts = await this.getCarts ();
        const search = carts.find ( object => object.id === id );
        return search ? search : false;
    }
    async deleteCart ( id ) {
        const cartJson = await this.getCarts ();
        const validId = cartJson.find ( valid => valid.id == id );
        const cartsRemain = cartJson.filter ( object => object.id != id );
        if ( cartsRemain && validId ) {
            this.writeDataBase ( cartsRemain );
            return true;
        } else {
            return false;
        }
    }
}

