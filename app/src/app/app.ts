
import { Component } from '@angular/core';

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  supplier: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  appName = 'StockPilot AI';
  searchTerm = '';
  activeFilter = 'all';

  products: Product[] = [
    { id: 1, name: 'Taladro percutor 800W', sku: 'HER-001', category: 'Herramientas eléctricas', stock: 12, minStock: 5, price: 65.00, supplier: 'FerreMax' },
    { id: 2, name: 'Martillo de acero 500g', sku: 'HER-002', category: 'Herramientas manuales', stock: 4, minStock: 10, price: 12.50, supplier: 'Suministros Díaz' },
    { id: 3, name: 'Tornillos 5cm (caja)', sku: 'FIJ-001', category: 'Fijaciones', stock: 32, minStock: 15, price: 4.25, supplier: 'FerreMax' },
    { id: 4, name: 'Pintura blanca 20L', sku: 'PIN-001', category: 'Pinturas', stock: 0, minStock: 5, price: 48.00, supplier: 'ColorHogar' },
    { id: 5, name: 'Cable eléctrico 2.5mm', sku: 'ELE-001', category: 'Electricidad', stock: 8, minStock: 12, price: 1.80, supplier: 'ElectroSur' },
    { id: 6, name: 'Destornillador Phillips', sku: 'HER-003', category: 'Herramientas manuales', stock: 25, minStock: 8, price: 6.75, supplier: 'Suministros Díaz' },
    { id: 7, name: 'Tubo PVC 1/2 pulgada', sku: 'PLO-001', category: 'Fontanería', stock: 3, minStock: 10, price: 3.90, supplier: 'HidroPlus' },
    { id: 8, name: 'Brocha de pintura 3 pulgadas', sku: 'PIN-002', category: 'Pinturas', stock: 18, minStock: 6, price: 5.25, supplier: 'ColorHogar' },
    { id: 9, name: 'Guantes de protección', sku: 'SEG-001', category: 'Seguridad', stock: 0, minStock: 8, price: 7.50, supplier: 'ProtecMax' },
    { id: 10, name: 'Llave ajustable 10 pulgadas', sku: 'HER-004', category: 'Herramientas manuales', stock: 7, minStock: 5, price: 18.90, supplier: 'FerreMax' },
  ];

  get totalProducts(): number {
    return this.products.length;
  }

  get totalValue(): number {
    return this.products.reduce(
      (total, product) => total + product.stock * product.price,
      0,
    );
  }

  get lowStockCount(): number {
    return this.products.filter(
      product => product.stock > 0 && product.stock <= product.minStock,
    ).length;
  }

  get outOfStockCount(): number {
    return this.products.filter(product => product.stock === 0).length;
  }

  get filteredProducts(): Product[] {
    const query = this.searchTerm.trim().toLowerCase();

    return this.products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      const matchesFilter =
        this.activeFilter === 'all' ||
        (this.activeFilter === 'low' &&
          product.stock > 0 &&
          product.stock <= product.minStock) ||
        (this.activeFilter === 'out' && product.stock === 0);

      return matchesSearch && matchesFilter;
    });
  }

  get restockProducts(): Product[] {
    return this.products.filter(
      product => product.stock <= product.minStock,
    );
  }

  getRestockQuantity(product: Product): number {
    return Math.max(product.minStock * 2 - product.stock, 0);
  }

  getStatus(product: Product): string {
    if (product.stock === 0) return 'Agotado';
    if (product.stock <= product.minStock) return 'Stock bajo';
    return 'Disponible';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
  }


  get criticalStockCount(): number {
    return this.products.filter(
      p => p.stock === 0 ||
        (p.stock > 0 && p.stock <= p.minStock / 2)
    ).length;
  }

  get estimatedRestockCost(): number {
    return this.restockProducts.reduce(
      (total, product) =>
        total + this.getRestockQuantity(product) * product.price,
      0
    );
  }

  get aiInsights(): string[] {
    const insights: string[] = [];

    const outOfStock = this.products.filter(p => p.stock === 0);
    const critical = this.products.filter(
      p => p.stock > 0 && p.stock <= p.minStock / 2
    );

    if (outOfStock.length > 0) {
      insights.push(
        `Prioridad máxima: ${outOfStock.length} producto(s) agotado(s). Revisa su reposición para evitar ventas perdidas.`
      );
    }

    if (critical.length > 0) {
      insights.push(
        `${critical.length} producto(s) tienen existencias iguales o inferiores a la mitad del mínimo.`
      );
    }

    const suppliers = new Set(
      this.restockProducts.map(p => p.supplier)
    );

    if (this.restockProducts.length > 0) {
      insights.push(
        `Hay ${this.restockProducts.length} productos que necesitan revisión, distribuidos entre ${suppliers.size} proveedor(es).`
      );
    } else {
      insights.push(
        'Todos los productos tienen existencias por encima del mínimo.'
      );
    }

    return insights;
  }

  getPriority(product: Product): string {
    if (product.stock === 0) return 'Urgente';

    if (product.stock <= product.minStock / 2) {
      return 'Alta';
    }

    return 'Normal';
  }

  getRestockCost(product: Product): number {
    return this.getRestockQuantity(product) * product.price;
  }

  getRestockReason(product: Product): string {
    if (product.stock === 0) {
      return 'Producto agotado: no quedan unidades disponibles.';
    }

    if (product.stock <= product.minStock / 2) {
      return 'Existencias críticas: quedan menos de la mitad del stock mínimo.';
    }

    return 'Stock por debajo del mínimo establecido.';
  }



  exportCsv(): void {
    const headers = [
      'SKU', 'Producto', 'Categoría', 'Stock',
      'Stock mínimo', 'Precio', 'Proveedor',
    ];

    const rows = this.products.map(product => [
      product.sku,
      product.name,
      product.category,
      product.stock,
      product.minStock,
      product.price,
      product.supplier,
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(value =>
        `"${String(value).replace(/"/g, '""')}"`,
      ).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stockpilot-inventario.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  importCsv(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const content = String(reader.result ?? '');
      const lines = content.split(/\r?\n/).filter(line => line.trim());

      if (lines.length < 2) {
        alert('El archivo CSV no contiene productos.');
        return;
      }

      const imported: Product[] = [];

      for (const line of lines.slice(1)) {
        const columns = line.split(',').map(value =>
          value.trim().replace(/^"|"$/g, '').replace(/""/g, '"'),
        );

        if (columns.length < 6) continue;

        const stock = Number(columns[3]);
        const minStock = Number(columns[4]);
        const price = Number(columns[5]);

        if (
          !columns[0] ||
          !columns[1] ||
          !Number.isFinite(stock) ||
          !Number.isFinite(minStock) ||
          !Number.isFinite(price)
        ) {
          continue;
        }

        imported.push({
          id: Date.now() + imported.length,
          sku: columns[0],
          name: columns[1],
          category: columns[2] || 'Sin categoría',
          stock,
          minStock,
          price,
          supplier: columns[6] || 'Sin proveedor',
        });
      }

      if (imported.length === 0) {
        alert('No se encontraron filas válidas. Revisa el formato CSV.');
        return;
      }

      this.products = imported;
      this.searchTerm = '';
      this.activeFilter = 'all';
      alert(`Se importaron ${imported.length} productos correctamente.`);
      input.value = '';
    };

    reader.readAsText(file);
  }
}
